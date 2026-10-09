import {
  GOTTINGEN_V2_0,
  GOTTINGEN_V3,
  LEVEL0_SIZES_ONLY,
  LEVEL2_UNTILED_V2,
} from "src/fixtures/iiif-image/info";
import { parseInfo } from "src/lib/renderer/sources/imageService";
import {
  chooseLevel,
  servicePyramid,
  staticPyramid,
  tilesInRegion,
} from "src/lib/renderer/sources/tilePyramid";

describe("servicePyramid", () => {
  it("builds the reference service's levels, coarse to fine, with a thumbnail", () => {
    const pyramid = servicePyramid(parseInfo(GOTTINGEN_V3));
    expect(pyramid.levels.map((l) => [l.scaleFactor, l.cols, l.rows])).toEqual([
      // Its own coarsest level is still 2×2 tiles, so a 512px whole image comes first.
      [4032 / 512, 1, 1],
      [4, 2, 2],
      [2, 4, 3],
      [1, 8, 6],
    ]);
  });

  it("cuts edge tiles to the image and sizes them by ceil(region / scale)", () => {
    const pyramid = servicePyramid(parseInfo(GOTTINGEN_V3));
    const finest = pyramid.levels.length - 1;
    const edge = pyramid.tile({ level: finest, col: 7, row: 5 });
    expect(edge.region).toEqual({ x: 3584, y: 2560, width: 448, height: 464 });
    expect(edge.url).toMatch(/\/3584,2560,448,464\/448,464\/0\/default\.jpg$/);

    const s4 = pyramid.tile({ level: 1, col: 1, row: 1 });
    expect(s4.region).toEqual({ x: 2048, y: 2048, width: 1984, height: 976 });
    expect(s4.url).toMatch(/\/2048,2048,1984,976\/496,244\//);
  });

  it("spells 2.0 tiles with w, and offers no native retry above level 0", () => {
    const pyramid = servicePyramid(parseInfo(GOTTINGEN_V2_0));
    const tile = pyramid.tile({ level: 1, col: 0, row: 0 });
    expect(tile.url).toMatch(/\/0,0,2048,2048\/512,\/0\/default\.jpg$/);
    expect(tile.fallbackUrl).toBeUndefined();
  });

  it("uses a level 0 tree's listed sizes as whole-image levels", () => {
    const pyramid = servicePyramid(parseInfo(LEVEL0_SIZES_ONLY));
    expect(pyramid.levels.map((l) => l.width)).toEqual([375, 750, 1500]);
    expect(pyramid.tile({ level: 2, col: 0, row: 0 }).url).toBe(
      "https://example.org/iiif/static/full/1500,1000/0/default.jpg",
    );
  });

  it("asks a level 0 2.x tree for `native` once `default` fails", () => {
    const pyramid = servicePyramid(
      parseInfo({
        "@context": "http://iiif.io/api/image/2/context.json",
        "@id": "https://example.org/old",
        profile: ["http://iiif.io/api/image/2/level0.json"],
        width: 1000,
        height: 800,
        tiles: [{ width: 256, scaleFactors: [1, 2, 4] }],
      }),
    );
    const tile = pyramid.tile({ level: 0, col: 0, row: 0 });
    expect(tile.url).toMatch(/\/default\.jpg$/);
    expect(tile.fallbackUrl).toMatch(/\/native\.jpg$/);
  });

  it("cuts its own 512px tiles for a level 2 service that lists none", () => {
    const pyramid = servicePyramid(parseInfo(LEVEL2_UNTILED_V2));
    expect(pyramid.levels.map((l) => l.scaleFactor)).toEqual([8, 4, 2, 1]);
    expect(pyramid.levels[pyramid.levels.length - 1]).toMatchObject({
      tileWidth: 512,
      cols: 5,
      rows: 3,
    });
  });
});

describe("chooseLevel", () => {
  const pyramid = servicePyramid(parseInfo(GOTTINGEN_V3));

  it("picks the coarsest level with at least one level pixel per device pixel", () => {
    // 3 image pixels per device pixel: scale factor 2 is the coarsest that is ≥ 1:1.
    expect(pyramid.levels[chooseLevel(pyramid, 3)].scaleFactor).toBe(2);
    expect(pyramid.levels[chooseLevel(pyramid, 4)].scaleFactor).toBe(4);
    expect(pyramid.levels[chooseLevel(pyramid, 100)].scaleFactor).toBeCloseTo(
      7.875,
    );
  });

  it("stays at full resolution when zoomed in past it", () => {
    expect(pyramid.levels[chooseLevel(pyramid, 0.25)].scaleFactor).toBe(1);
  });
});

describe("tilesInRegion", () => {
  const pyramid = servicePyramid(parseInfo(GOTTINGEN_V3));
  const finest = pyramid.levels.length - 1;

  it("returns only the tiles a region touches", () => {
    const tiles = tilesInRegion(pyramid, finest, {
      x: 500,
      y: 500,
      width: 600,
      height: 100,
    });
    expect(tiles.map((t) => [t.col, t.row])).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
  });

  it("is empty outside the image", () => {
    expect(
      tilesInRegion(pyramid, finest, { x: 5000, y: 0, width: 10, height: 10 }),
    ).toEqual([]);
  });

  it("treats a static image as one level of one tile", () => {
    const one = staticPyramid("a.jpg", 800, 600);
    expect(
      tilesInRegion(one, 0, { x: 0, y: 0, width: 800, height: 600 }),
    ).toEqual([{ level: 0, col: 0, row: 0 }]);
    expect(one.tile({ level: 0, col: 0, row: 0 }).url).toBe("a.jpg");
  });
});
