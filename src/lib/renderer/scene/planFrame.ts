import {
  type CameraState,
  type ViewportSize,
  visibleWorldRect,
  worldToScreen,
} from "src/lib/renderer/camera/Camera";
import type { LoadedImage } from "src/lib/renderer/io/decode";
import type { TileWant } from "src/lib/renderer/io/TileCache";
import {
  type Affine,
  compose,
  scale,
  translate,
} from "src/lib/renderer/math/affine";
import { type Rect, intersects } from "src/lib/renderer/math/rect";
import {
  type SceneItem,
  pixelsToWorld,
} from "src/lib/renderer/scene/sceneItem";
import type { RegionRect } from "src/lib/renderer/sources/imageService";
import {
  type TileAddress,
  chooseLevel,
  tilesInRegion,
} from "src/lib/renderer/sources/tilePyramid";

/** One tile to draw this frame, ready for a backend or a DOM layer. */
export interface PlannedDraw {
  item: SceneItem;
  url: string;
  image: LoadedImage;
  /** Source pixels → stage CSS pixels. */
  transform: Affine;
  /** The part of the source inside the item's clip, in source pixels. */
  crop: Rect;
  bleed: { right: boolean; bottom: boolean };
}

export interface FramePlan {
  /** In paint order: coarse before fine, item by item. */
  draws: PlannedDraw[];
  /** What the tile cache should be fetching, highest priority first. */
  wants: TileWant[];
  /** The level chosen per item, for diagnostics. */
  levels: number[];
}

export interface PlanInput {
  items: SceneItem[];
  camera: CameraState;
  viewport: ViewportSize;
  pixelRatio: number;
  getTile: (url: string) => LoadedImage | undefined;
  /** Also want every coarsest-level tile (the navigator shows the whole image). */
  wantOverview?: boolean;
}

/** Priority bands: coarse tiles under the view, then the target level, then the overview. */
const TARGET_BAND = 1e7;
const OVERVIEW_BAND = 2e7;

/**
 * Decide one frame: which tiles to draw, and which to fetch.
 *
 * Pure — no DOM, no I/O — so it is the renderer's main test seam.
 *
 * Per item it picks the coarsest pyramid level with at least one level pixel per device
 * pixel, and wants that level's tiles under the view plus the coarsest level's (so there
 * is always *something*). It draws the target level, and when any of its tiles are still
 * missing, every coarser level that has tiles beneath it first — so a gap shows a blurrier
 * picture, never the background.
 */
export function planFrame(input: PlanInput): FramePlan {
  const { items, camera, viewport, pixelRatio, getTile } = input;
  const view = worldToScreen(camera, viewport);
  const visible = visibleWorldRect(camera, viewport);
  const draws: PlannedDraw[] = [];
  const wants: TileWant[] = [];
  const levels: number[] = [];

  for (const item of items) {
    const { pyramid, clip, rect } = item;
    const k = pixelsToWorld(item);

    if (input.wantOverview) {
      for (const address of tilesInRegion(pyramid, 0, clip)) {
        const tile = pyramid.tile(address);
        wants.push({
          url: tile.url,
          fallbackUrl: tile.fallbackUrl,
          priority: OVERVIEW_BAND,
        });
      }
    }

    if (!intersects(visible, rect)) {
      levels.push(-1);
      continue;
    }

    // The visible part of the item, in full-size image pixels.
    const x0 = Math.max(visible.x, rect.x);
    const y0 = Math.max(visible.y, rect.y);
    const x1 = Math.min(visible.x + visible.width, rect.x + rect.width);
    const y1 = Math.min(visible.y + visible.height, rect.y + rect.height);
    const area: RegionRect = {
      x: clip.x + (x0 - rect.x) / k.x,
      y: clip.y + (y0 - rect.y) / k.y,
      width: (x1 - x0) / k.x,
      height: (y1 - y0) / k.y,
    };
    const center = {
      x: clip.x + (camera.x - rect.x) / k.x,
      y: clip.y + (camera.y - rect.y) / k.y,
    };

    // Full-size image pixels under one device pixel.
    const imagePerDevice = 1 / (k.x * camera.zoom * pixelRatio);
    const target = chooseLevel(pyramid, imagePerDevice);
    levels.push(target);

    const distance = (address: TileAddress) => {
      const r = pyramid.tile(address).region;
      return Math.hypot(
        r.x + r.width / 2 - center.x,
        r.y + r.height / 2 - center.y,
      );
    };

    const coarse = tilesInRegion(pyramid, 0, area);
    const fine = target === 0 ? [] : tilesInRegion(pyramid, target, area);
    for (const address of coarse) {
      const tile = pyramid.tile(address);
      wants.push({
        url: tile.url,
        fallbackUrl: tile.fallbackUrl,
        priority: distance(address) / 1e3,
      });
    }
    for (const address of fine) {
      const tile = pyramid.tile(address);
      wants.push({
        url: tile.url,
        fallbackUrl: tile.fallbackUrl,
        priority: TARGET_BAND + distance(address),
      });
    }

    // Paint coarse to fine. When the target level is complete, it alone is enough.
    const targetTiles = target === 0 ? coarse : fine;
    const complete = targetTiles.every(
      (a) => getTile(pyramid.tile(a).url) !== undefined,
    );
    const paintLevels = complete
      ? [target]
      : Array.from({ length: target + 1 }, (_, i) => i);

    const itemToScreen = compose(
      view,
      translate(rect.x, rect.y),
      scale(k.x, k.y),
      translate(-clip.x, -clip.y),
    );

    for (const level of paintLevels) {
      const addresses =
        level === 0
          ? coarse
          : level === target
            ? fine
            : tilesInRegion(pyramid, level, area);
      const multiTile =
        pyramid.levels[level].cols * pyramid.levels[level].rows > 1;
      for (const address of addresses) {
        const tile = pyramid.tile(address);
        const image = getTile(tile.url);
        if (!image) continue;
        const draw = placeTile(
          item,
          tile.region,
          image,
          itemToScreen,
          multiTile,
        );
        if (draw) draws.push({ ...draw, url: tile.url });
      }
    }
  }

  wants.sort((a, b) => a.priority - b.priority);
  return { draws, wants: dedupeWants(wants), levels };
}

function placeTile(
  item: SceneItem,
  region: RegionRect,
  image: LoadedImage,
  itemToScreen: Affine,
  multiTile: boolean,
): Omit<PlannedDraw, "url"> | null {
  const { clip } = item;
  // Only the part of the tile inside the clip.
  const ix0 = Math.max(region.x, clip.x);
  const iy0 = Math.max(region.y, clip.y);
  const ix1 = Math.min(region.x + region.width, clip.x + clip.width);
  const iy1 = Math.min(region.y + region.height, clip.y + clip.height);
  if (ix1 <= ix0 || iy1 <= iy0) return null;

  const sx = image.width / region.width;
  const sy = image.height / region.height;
  const eps = 1e-6;

  return {
    item,
    image,
    transform: compose(
      itemToScreen,
      translate(region.x, region.y),
      scale(1 / sx, 1 / sy),
    ),
    crop: {
      x: (ix0 - region.x) * sx,
      y: (iy0 - region.y) * sy,
      width: (ix1 - ix0) * sx,
      height: (iy1 - iy0) * sy,
    },
    bleed: {
      right: multiTile && ix1 < clip.x + clip.width - eps,
      bottom: multiTile && iy1 < clip.y + clip.height - eps,
    },
  };
}

function dedupeWants(wants: TileWant[]): TileWant[] {
  const seen = new Set<string>();
  return wants.filter((want) => {
    if (seen.has(want.url)) return false;
    seen.add(want.url);
    return true;
  });
}
