import { GOTTINGEN_V3 } from "src/fixtures/iiif-image/info";
import { fitCamera } from "src/lib/renderer/camera/Camera";
import type { LoadedImage } from "src/lib/renderer/io/decode";
import { apply } from "src/lib/renderer/math/affine";
import { planFrame } from "src/lib/renderer/scene/planFrame";
import { parseRegion } from "src/lib/renderer/scene/regions";
import { type SceneItem, layoutItems } from "src/lib/renderer/scene/sceneItem";
import { parseInfo } from "src/lib/renderer/sources/imageService";
import { servicePyramid } from "src/lib/renderer/sources/tilePyramid";

const viewport = { width: 800, height: 600 };

function gottingen(region?: string): SceneItem {
  const pyramid = servicePyramid(parseInfo(GOTTINGEN_V3));
  const size = { width: 4032, height: 3024 };
  const clip = parseRegion(region, 4032, 3024) ?? {
    x: 0,
    y: 0,
    ...size,
  };
  const item: SceneItem = {
    id: "g",
    spec: { id: "g" },
    pyramid,
    size,
    clip,
    contentClip: clip,
    rect: { x: 0, y: 0, width: 0, height: 0 },
  };
  layoutItems([item]);
  return item;
}

function tileImage(width: number, height: number): LoadedImage {
  return {
    kind: "bitmap",
    source: {} as ImageBitmap,
    width,
    height,
    naturalWidth: width,
    naturalHeight: height,
    opaque: false,
  };
}

/** A cache holding every tile, sized as the server would send it. */
const everything = (item: SceneItem) => {
  const sizes = new Map<string, [number, number]>();
  item.pyramid.levels.forEach((level, index) => {
    for (let row = 0; row < level.rows; row++) {
      for (let col = 0; col < level.cols; col++) {
        const tile = item.pyramid.tile({ level: index, col, row });
        sizes.set(tile.url, [
          Math.ceil(tile.region.width / level.scaleFactor),
          Math.ceil(tile.region.height / level.scaleFactor),
        ]);
      }
    }
  });
  return (url: string) => {
    const size = sizes.get(url);
    return size ? tileImage(size[0], size[1]) : undefined;
  };
};

describe("planFrame", () => {
  it("at home, wants the thumbnail first and a fitting level after it", () => {
    const item = gottingen();
    const camera = fitCamera(item.rect, viewport);
    const plan = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: () => undefined,
    });
    // 4032px into 800 CSS px at 1x: ~5 image px per device px → scale factor 4.
    expect(item.pyramid.levels[plan.levels[0]].scaleFactor).toBe(4);
    expect(plan.wants[0].url).toMatch(/\/full\/512,384\//);
    expect(plan.wants).toHaveLength(1 + 4);
    expect(plan.draws).toHaveLength(0);
  });

  it("doubles the resolution it asks for on a 2x display", () => {
    const item = gottingen();
    const camera = fitCamera(item.rect, viewport);
    const plan = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 2,
      getTile: () => undefined,
    });
    expect(item.pyramid.levels[plan.levels[0]].scaleFactor).toBe(2);
  });

  it("only wants tiles under the view when zoomed in", () => {
    const item = gottingen();
    const camera = { x: 100, y: 100, zoom: 1, rotation: 0 };
    const plan = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: () => undefined,
    });
    // Full resolution; the view spans x −300…500, y −200…400 → tiles (0,0) only.
    const fine = plan.wants.filter((w) =>
      /\/0,0,512,512\/512,512\//.test(w.url),
    );
    expect(fine).toHaveLength(1);
    expect(plan.wants).toHaveLength(2);
  });

  it("draws coarser tiles under missing ones, then only the target once complete", () => {
    const item = gottingen();
    const camera = fitCamera(item.rect, viewport);
    const all = everything(item);
    const thumbnailOnly = (url: string) =>
      /\/full\//.test(url) ? all(url) : undefined;

    const partial = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: thumbnailOnly,
    });
    expect(partial.draws.map((d) => d.url)).toEqual([
      expect.stringMatching(/\/full\/512,384\//),
    ]);

    const complete = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: all,
    });
    expect(complete.draws).toHaveLength(4);
    expect(complete.draws.every((d) => !/\/full\//.test(d.url))).toBe(true);
  });

  it("places tiles edge to edge on screen, with a bleed only between neighbours", () => {
    const item = gottingen();
    const camera = fitCamera(item.rect, viewport);
    const plan = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: everything(item),
    });
    const corners = plan.draws.map((d) => ({
      topLeft: apply(d.transform, { x: d.crop.x, y: d.crop.y }),
      bottomRight: apply(d.transform, {
        x: d.crop.x + d.crop.width,
        y: d.crop.y + d.crop.height,
      }),
      bleed: d.bleed,
    }));
    const [a, b, c, d] = corners;
    expect(a.topLeft.x).toBeCloseTo(0, 6);
    expect(b.topLeft.x).toBeCloseTo(a.bottomRight.x, 6);
    expect(c.topLeft.y).toBeCloseTo(a.bottomRight.y, 6);
    expect(d.bottomRight.x).toBeCloseTo(800, 6);
    expect(a.bleed).toEqual({ right: true, bottom: true });
    expect(d.bleed).toEqual({ right: false, bottom: false });
  });

  it("crops tiles to a region clip, which then fills the world", () => {
    const item = gottingen("1000,500,1000,800");
    expect(item.rect).toEqual({ x: 0, y: 0, width: 1000, height: 800 });
    const camera = fitCamera(item.rect, viewport);
    const plan = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: everything(item),
    });
    expect(plan.draws.length).toBeGreaterThan(0);
    for (const draw of plan.draws) {
      const p = apply(draw.transform, { x: draw.crop.x, y: draw.crop.y });
      expect(p.x).toBeGreaterThanOrEqual(-1e-6);
      expect(p.y).toBeGreaterThanOrEqual(-1e-6);
    }
  });

  it("wants the whole coarsest level for the navigator, even offscreen", () => {
    const item = gottingen();
    const camera = { x: 100000, y: 100000, zoom: 1, rotation: 0 };
    const plan = planFrame({
      items: [item],
      camera,
      viewport,
      pixelRatio: 1,
      getTile: () => undefined,
      wantOverview: true,
    });
    expect(plan.levels).toEqual([-1]);
    expect(plan.wants).toHaveLength(1);
  });
});
