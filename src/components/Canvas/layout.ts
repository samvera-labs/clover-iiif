import { parseAnnotationTarget } from "src/lib/annotation-helpers";
import type { Rect, SceneImage } from "src/lib/renderer";
import { findImageServiceId } from "src/lib/renderer";

/**
 * What `Canvas` draws: the IIIF Canvases it is handed, each with the images, video and
 * sound it paints.
 *
 * Pure and React-free. It reads IIIF Presentation 3 Canvases as published, with their
 * annotation pages embedded, and turns them into scene images placed in the world.
 * Which Canvases to hand over — one, or a spread — is the host's decision; see
 * `src/lib/iiif-sequence.ts`.
 */

/** The order to lay several Canvases out in, along their reading axis. */
export type ViewingDirection =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top";

/** The parts of a IIIF Canvas this module reads. */
export interface IIIFCanvas {
  id: string;
  type?: string;
  width?: number;
  height?: number;
  behavior?: string[] | string;
  label?: unknown;
  /** Descriptive text and label/value pairs, shown from the Canvas's information control. */
  summary?: unknown;
  metadata?: Array<{ label?: unknown; value?: unknown }>;
  /** Seconds, on a time-based Canvas. */
  duration?: number;
  items?: Array<{ items?: Array<IIIFAnnotation> }>;
  /** Non-painting annotations, embedded: captions are `supplementing` WebVTT here. */
  annotations?: Array<{ items?: Array<IIIFAnnotation> }>;
  /** Shown before playback begins. */
  placeholderCanvas?: IIIFCanvas;
  /** Shown while sound plays, which has no picture of its own. */
  accompanyingCanvas?: IIIFCanvas;
}

interface IIIFAnnotation {
  id?: string;
  motivation?: string | string[];
  body?: unknown;
  target?: unknown;
}

/**
 * A painting annotation whose body is a `Choice`: alternative images of the same thing
 * (natural light and X-ray, say). One is painted at a time, the first by default.
 */
export interface ChoiceGroup {
  /** Identifies this Choice across renders: the selection is keyed by it. */
  key: string;
  canvasId: string;
  /** The Choice's own `label`, when the Manifest gives it one. */
  label?: unknown;
  items: Array<{ label?: unknown; id?: string }>;
}

/** Which item of each Choice to paint, by `ChoiceGroup.key`. Missing means the first. */
export type ChoiceSelections = Record<string, number>;

/** One image painted on a Canvas, and the area of the Canvas it paints. */
export interface PaintedImage {
  body: Record<string, any>;
  /** Canvas coordinates. The whole Canvas when the target names no region. */
  target: Rect;
  /** A region of the image itself (an Image API selector or `body.region`). */
  region?: string;
}

/** Video or sound painted on a Canvas: one media element plays it. */
export interface PaintedMedia {
  kind: "video" | "audio";
  body: Record<string, any>;
  /** Canvas coordinates. The whole Canvas when the target names no region. */
  target: Rect;
}

/** A WebVTT file supplementing a Canvas: captions or subtitles. */
export interface CaptionTrack {
  id: string;
  label?: unknown;
  language?: string;
}

/** The media of the Canvases handed in, placed in the world. */
export interface MediaPlacement {
  /** Stable for a Canvas and its chosen source. */
  id: string;
  kind: "video" | "audio";
  src: string;
  format?: string;
  /** World units. */
  placement: Rect;
  duration?: number;
  /** A still to show before playback: the placeholder Canvas's first image. */
  poster?: string;
  captions: CaptionTrack[];
}

/** A duration-only Canvas (sound) has no size; it is laid out at this one, 16:9. */
const TIME_BASED_CANVAS = { width: 1600, height: 900 };

const DIRECTIONS: ViewingDirection[] = [
  "left-to-right",
  "right-to-left",
  "top-to-bottom",
  "bottom-to-top",
];

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value === undefined ? [] : [value];

/** The spec's default is `left-to-right`. */
export function resolveDirection(declared: unknown): ViewingDirection {
  return DIRECTIONS.includes(declared as ViewingDirection)
    ? (declared as ViewingDirection)
    : "left-to-right";
}

/**
 * Where each Canvas sits in the world.
 *
 * One Canvas fills the world. Several are laid along the reading axis — horizontally for
 * `left-to-right` and `right-to-left`, vertically for `top-to-bottom` and `bottom-to-top`
 * — in reading order, so a right-to-left spread puts its first page on the right. Across
 * the axis they are matched in size (a common height in a row, a common width in a
 * column), as the pages of an open book are, at the first Canvas's own size. World units
 * are therefore the first Canvas's coordinates, which is what an `xywh` refers to.
 */
export function arrangeCanvases(
  canvases: IIIFCanvas[],
  direction: ViewingDirection,
): Rect[] {
  const placements: Rect[] = new Array(canvases.length);
  if (!canvases.length) return placements;
  const sizes = canvases.map(canvasSize);
  const horizontal =
    direction === "left-to-right" || direction === "right-to-left";
  const reversed =
    direction === "right-to-left" || direction === "bottom-to-top";
  const common = horizontal ? sizes[0].height : sizes[0].width;

  const order = canvases.map((_, index) => index);
  if (reversed) order.reverse();

  let along = 0;
  for (const index of order) {
    const size = sizes[index];
    const scale = common / (horizontal ? size.height : size.width);
    const width = size.width * scale;
    const height = size.height * scale;
    placements[index] = horizontal
      ? { x: along, y: 0, width, height }
      : { x: 0, y: along, width, height };
    along += horizontal ? width : height;
  }
  return placements;
}

/**
 * A Canvas's coordinate space. One without dimensions — sound has only a duration —
 * takes its accompanying or placeholder Canvas's, then its first image's or video's, then
 * a 16:9 frame.
 */
export function canvasSize(canvas: IIIFCanvas): {
  width: number;
  height: number;
} {
  if (canvas.width && canvas.height) {
    return { width: canvas.width, height: canvas.height };
  }
  const companion = companionCanvas(canvas);
  if (companion?.width && companion.height) {
    return { width: companion.width, height: companion.height };
  }
  const first = paintedImages(canvas)[0]?.body ?? paintedMedia(canvas)[0]?.body;
  const width = Number(first?.width);
  const height = Number(first?.height);
  return width > 0 && height > 0 ? { width, height } : TIME_BASED_CANVAS;
}

/**
 * The Canvas whose images stand in for sound's missing picture: the accompanying Canvas
 * (meant to be shown during playback), else the placeholder.
 */
function companionCanvas(canvas: IIIFCanvas): IIIFCanvas | undefined {
  return canvas.accompanyingCanvas ?? canvas.placeholderCanvas;
}

/** A stable key for the `Choice` in one body of one painting annotation. */
function choiceKey(
  canvas: IIIFCanvas,
  annotation: IIIFAnnotation,
  page: number,
  index: number,
  body: number,
): string {
  return `${canvas.id}|${annotation.id ?? `${page}:${index}`}|${body}`;
}

/** Every painting annotations' `Choice` across the Canvases, in painting order. */
export function findChoices(canvases: IIIFCanvas[]): ChoiceGroup[] {
  const groups: ChoiceGroup[] = [];
  for (const canvas of canvases) {
    eachPaintingBody(canvas, (raw, key) => {
      const body = raw as Record<string, any> | null;
      if (body?.type !== "Choice") return;
      const items = asArray(body.items).filter(
        (item): item is Record<string, any> =>
          Boolean(item) && typeof item === "object",
      );
      if (items.length > 1) {
        groups.push({
          key,
          canvasId: canvas.id,
          label: body.label,
          items: items.map((item) => ({ label: item.label, id: item.id })),
        });
      }
    });
  }
  return groups;
}

function eachPaintingBody(
  canvas: IIIFCanvas,
  visit: (body: unknown, key: string, annotation: IIIFAnnotation) => void,
) {
  (canvas.items ?? []).forEach((page, p) => {
    (page.items ?? []).forEach((annotation, a) => {
      const motivations = asArray(annotation.motivation);
      if (motivations.length && !motivations.includes("painting")) return;
      asArray(annotation.body).forEach((body, b) =>
        visit(body, choiceKey(canvas, annotation, p, a, b), annotation),
      );
    });
  });
}

/**
 * The images a Canvas paints, in painting order (later paints over earlier).
 *
 * - A `Choice` paints the item `selections` names, or its first — the spec's default.
 * - A `SpecificResource` body paints its `source`, cropped by an Image API selector's
 *   `region` when it has one.
 * - The target's `#xywh=` places the image on part of the Canvas — one photograph inset
 *   in another (Cookbook recipe 0036) — and the image is scaled to fill that area.
 * - Non-image bodies (sound, video, text) are skipped here.
 */
export function paintedImages(
  canvas: IIIFCanvas,
  selections: ChoiceSelections = {},
): PaintedImage[] {
  const images: PaintedImage[] = [];
  eachPainted(canvas, selections, (resolved, target) => {
    if (resolved.body.type !== "Image") return;
    images.push({ body: resolved.body, region: resolved.region, target });
  });
  return images;
}

/**
 * The video or sound a Canvas paints. A `Choice` of sources (two qualities, say) plays
 * the selected one. Only the first is played: one Canvas, one media element.
 */
export function paintedMedia(
  canvas: IIIFCanvas,
  selections: ChoiceSelections = {},
): PaintedMedia[] {
  const media: PaintedMedia[] = [];
  eachPainted(canvas, selections, (resolved, target) => {
    const type = resolved.body.type;
    if (type !== "Video" && type !== "Sound") return;
    media.push({
      kind: type === "Video" ? "video" : "audio",
      body: resolved.body,
      target,
    });
  });
  return media;
}

function eachPainted(
  canvas: IIIFCanvas,
  selections: ChoiceSelections,
  visit: (
    resolved: { body: Record<string, any>; region?: string },
    target: Rect,
  ) => void,
) {
  const width = canvas.width ?? 0;
  const height = canvas.height ?? 0;
  eachPaintingBody(canvas, (rawBody, key, annotation) => {
    const resolved = resolveBody(rawBody, selections[key] ?? 0);
    if (!resolved) return;
    const parsed = annotation.target
      ? parseAnnotationTarget(annotation.target as any)
      : undefined;
    const rect = parsed?.rect;
    visit(
      resolved,
      rect
        ? { x: rect.x, y: rect.y, width: rect.w, height: rect.h }
        : {
            x: 0,
            y: 0,
            width: width || Number(resolved.body.width) || 0,
            height: height || Number(resolved.body.height) || 0,
          },
    );
  });
}

/**
 * WebVTT captions supplementing a Canvas, from its `annotations` (and, leniently, its
 * `items`). A `Choice` of caption files — one per language — offers them all.
 */
export function canvasCaptions(canvas: IIIFCanvas): CaptionTrack[] {
  const tracks: CaptionTrack[] = [];
  const pages = [...(canvas.annotations ?? []), ...(canvas.items ?? [])];
  for (const page of pages) {
    for (const annotation of page.items ?? []) {
      if (!asArray(annotation.motivation).includes("supplementing")) continue;
      for (const raw of asArray(annotation.body)) {
        const body = raw as Record<string, any>;
        const bodies = body?.type === "Choice" ? asArray(body.items) : [body];
        for (const candidate of bodies as Array<Record<string, any>>) {
          const id = candidate?.id;
          const isVtt =
            candidate?.format === "text/vtt" ||
            (typeof id === "string" && /\.vtt(\?|$)/i.test(id));
          if (!isVtt || typeof id !== "string") continue;
          tracks.push({
            id,
            label: candidate.label,
            language: asArray(candidate.language)[0] as string | undefined,
          });
        }
      }
    }
  }
  return tracks;
}

function resolveBody(
  raw: unknown,
  choice = 0,
): { body: Record<string, any>; region?: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, any>;

  if (body.type === "Choice") {
    const items = asArray(body.items);
    return resolveBody(items[choice] ?? items[0]);
  }
  if (body.type === "SpecificResource" && body.source) {
    const source =
      typeof body.source === "string" ? { id: body.source } : body.source;
    const selector = asArray(body.selector).find(
      (s: any) => s?.type === "ImageApiSelector" && s.region,
    ) as { region?: string } | undefined;
    const inner = resolveBody({ type: "Image", ...source });
    return inner
      ? { ...inner, region: selector?.region ?? inner.region }
      : null;
  }
  if (body.type !== "Image" && body.type !== "Video" && body.type !== "Sound") {
    return null;
  }
  return {
    body,
    region: typeof body.region === "string" ? body.region : undefined,
  };
}

/**
 * The scene for the Canvases handed in: every image each one paints, placed in the
 * world. Ids are stable per Canvas and image, so a host moving between pages keeps
 * decoded tiles for any Canvas it shows again.
 */
export function canvasScene(
  canvases: IIIFCanvas[],
  direction: ViewingDirection,
  selections: ChoiceSelections = {},
): { images: SceneImage[]; media: MediaPlacement[]; placements: Rect[] } {
  const placements = arrangeCanvases(canvases, direction);
  const images: SceneImage[] = [];
  const media: MediaPlacement[] = [];

  canvases.forEach((canvas, index) => {
    const place = placements[index];
    const size = canvasSize(canvas);
    const kx = place.width / size.width;
    const ky = place.height / size.height;
    const toWorld = (target: Rect): Rect => ({
      x: place.x + target.x * kx,
      y: place.y + target.y * ky,
      width: target.width * kx,
      height: target.height * ky,
    });

    const sounds = paintedMedia(canvas, selections);
    const painted = paintedImages(canvas, selections).map((image) => ({
      ...image,
      canvas,
    }));

    /*
     * Sound has no picture, so the Canvas shows its accompanying (or placeholder)
     * Canvas's images instead, stretched over it — as the Player shows a poster.
     */
    const companion = companionCanvas(canvas);
    if (
      !painted.length &&
      sounds.some((m) => m.kind === "audio") &&
      companion
    ) {
      const companionSize = canvasSize(companion);
      for (const image of paintedImages(companion)) {
        painted.push({
          ...image,
          canvas: companion,
          target: {
            x: (image.target.x / companionSize.width) * size.width,
            y: (image.target.y / companionSize.height) * size.height,
            width: (image.target.width / companionSize.width) * size.width,
            height: (image.target.height / companionSize.height) * size.height,
          },
        });
      }
    }

    painted.forEach(({ body, target, region, canvas: owner }, n) => {
      const service = findImageServiceId(body.service);
      if (!service && !body.id) return;
      images.push({
        id: `${owner.id}|${n}|${body.id ?? service}|${region ?? ""}`,
        service,
        url: body.id,
        width: Number(body.width) || undefined,
        height: Number(body.height) || undefined,
        region,
        placement: toWorld(target),
      });
    });

    const [first] = sounds;
    if (first?.body.id) {
      media.push({
        id: `${canvas.id}|media|${first.body.id}`,
        kind: first.kind,
        src: first.body.id,
        format: first.body.format,
        placement: toWorld(first.target),
        duration: Number(first.body.duration ?? canvas.duration) || undefined,
        poster: posterFor(canvas),
        captions: canvasCaptions(canvas),
      });
    }
  });
  return { images, media, placements };
}

/** The placeholder Canvas's first image, as a still for a video's poster frame. */
function posterFor(canvas: IIIFCanvas): string | undefined {
  const placeholder = canvas.placeholderCanvas;
  if (!placeholder) return undefined;
  const body = paintedImages(placeholder)[0]?.body;
  if (!body) return undefined;
  const service = findImageServiceId(body.service);
  return service
    ? `${service}/full/!1280,1280/0/default.jpg`
    : (body.id as string | undefined);
}

/** A rectangle in a Canvas's own coordinates, in world units. */
export function canvasRectToWorld(
  canvas: IIIFCanvas,
  placement: Rect,
  rect: Rect,
): Rect {
  const size = canvasSize(canvas);
  const kx = placement.width / size.width;
  const ky = placement.height / size.height;
  return {
    x: placement.x + rect.x * kx,
    y: placement.y + rect.y * ky,
    width: rect.width * kx,
    height: rect.height * ky,
  };
}
