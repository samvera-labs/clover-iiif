import annotationJson from "../fixtures/iiif-cookbook/0139-geolocate-canvas-fragment.json";
import manifestJson from "../fixtures/iiif-cookbook/0154-geo-extension.json";
import canvasesJson from "../fixtures/iiif-cookbook/0240-navPlace-on-canvases.json";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DC_CANVAS_ID,
  DC_GEOREF_ANNOTATION_CANVAS,
  DC_IMAGE_SERVICE_V3_ID,
  evanston,
} from "../fixtures/georef";
import { p4 } from "../fixtures/presentation4";
import {
  affineTransform,
  boundsOf,
  cornersOf,
  georeferencesOf,
  hasMapData,
  navPlaceOf,
  readGeoreference,
} from "./geo";

describe("navPlaceOf", () => {
  it("reads a Manifest's navPlace, titled in the reader's language", () => {
    const { features } = navPlaceOf(p4(manifestJson), null, "it");
    expect(features).toHaveLength(1);
    expect(features[0].geometry.type).toBe("Point");
    expect(features[0].properties.title).toBe(
      "Bronzo Laocoonte e i suoi figli",
    );
    expect(features[0].properties.canvasId).toBeUndefined();
  });

  it("names the Canvas a Canvas's navPlace belongs to", () => {
    const manifest = p4(canvasesJson);
    const { features } = navPlaceOf(manifest);
    expect(features.map((f) => f.properties.canvasId)).toEqual(
      canvasesJson.items.map((canvas) => canvas.id),
    );
    expect(features[1].properties.title).toBe("Current Location of Painting");
  });

  it("reads a GeoJSON annotation body, on the Canvas it targets", () => {
    const { features } = navPlaceOf(p4(annotationJson));
    expect(features.length).toBeGreaterThan(0);
    expect(features[0].properties.canvasId).toBe(annotationJson.items[0].id);
  });

  it("is memoised on the Manifest, and shared when empty", () => {
    const manifest = p4(canvasesJson);
    expect(navPlaceOf(manifest)).toBe(navPlaceOf(manifest));
    const bare = p4({ ...canvasesJson, items: [] });
    expect(navPlaceOf(bare)).toBe(navPlaceOf(null));
  });
});

describe("georeferences", () => {
  it("reads a stored annotation: points, extent, and the Canvas's painted image", () => {
    const [georeference] = georeferencesOf(evanston());
    expect(georeference.canvasId).toBe(DC_CANVAS_ID);
    expect(georeference.points.length).toBeGreaterThanOrEqual(3);
    expect([georeference.width, georeference.height]).toEqual([
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    ]);
    // Its selector is the whole image, so there is no mask.
    expect(georeference.mask).toBeUndefined();
    expect((georeference.image as any).service[0].id).toBe(
      DC_IMAGE_SERVICE_V3_ID,
    );
    expect(hasMapData(evanston())).toBe(true);
  });

  it("takes an annotation on an image service directly, with its mask", () => {
    const georeference = readGeoreference({
      ...DC_GEOREF_ANNOTATION_CANVAS,
      target: {
        type: "SpecificResource",
        source: {
          id: DC_IMAGE_SERVICE_V3_ID,
          type: "ImageService3",
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        },
        selector: {
          type: "SvgSelector",
          value:
            '<svg><polygon points="100,100 7000,120 6900,9700 90,9600" /></svg>',
        },
      },
    });
    expect(georeference?.canvasId).toBeUndefined();
    expect(georeference?.mask).toEqual([
      [100, 100],
      [7000, 120],
      [6900, 9700],
      [90, 9600],
    ]);
  });

  it("needs three points", () => {
    const two = {
      ...DC_GEOREF_ANNOTATION_CANVAS,
      body: {
        ...DC_GEOREF_ANNOTATION_CANVAS.body,
        features: DC_GEOREF_ANNOTATION_CANVAS.body.features.slice(0, 2),
      },
    };
    expect(readGeoreference(two, { width: 10, height: 10 })).toBeNull();
  });
});

describe("the affine overlay", () => {
  it("passes through its control points", () => {
    const [georeference] = georeferencesOf(evanston());
    const transform = affineTransform(georeference.points)!;
    for (const { resource, geo } of georeference.points.slice(0, 3)) {
      const [lng, lat] = transform(resource);
      // Least squares over every point: within a few hundred metres of each.
      expect(Math.abs(lng - geo[0])).toBeLessThan(0.01);
      expect(Math.abs(lat - geo[1])).toBeLessThan(0.01);
    }
  });

  it("puts the corners around Evanston, top left first, north up", () => {
    const [georeference] = georeferencesOf(evanston());
    const [tl, tr, br, bl] = cornersOf(georeference)!;
    for (const [lng, lat] of [tl, tr, br, bl]) {
      expect(lng).toBeGreaterThan(-88);
      expect(lng).toBeLessThan(-87.5);
      expect(lat).toBeGreaterThan(41.9);
      expect(lat).toBeLessThan(42.2);
    }
    expect(tl[1]).toBeGreaterThan(bl[1]);
    expect(tr[0]).toBeGreaterThan(tl[0]);
    void br;
  });

  it("bounds the features and the overlays together", () => {
    const features = navPlaceOf(p4(canvasesJson)).features;
    const [georeference] = georeferencesOf(evanston());
    const [[west, south], [east, north]] = boundsOf(features, [georeference])!;
    expect(west).toBeLessThan(east);
    expect(south).toBeLessThan(north);
    expect(boundsOf([], [])).toBeNull();
  });
});
