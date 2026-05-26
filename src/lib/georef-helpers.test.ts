import { describe, expect, it } from "vitest";

import {
  CANVAS_HEIGHT,
  CANVAS_ID,
  CANVAS_WIDTH,
  EXAMPLE_NAV_PLACE,
  EXAMPLE_NAV_PLACE_FEATURE,
  EXAMPLE_NAV_PLACE_POLYGON,
  EXPECTED_GCPS,
  GEOREF_ANNOTATION_CANVAS,
  GEOREF_ANNOTATION_IMAGE_SERVICE,
  IMAGE_SERVICE_V2_ID,
} from "src/fixtures/georef";
import {
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
  getNavPlaceLabel,
  isGeoreferenceAnnotation,
  normalizeNavPlace,
  parseGeoreferenceAnnotation,
} from "src/lib/georef-helpers";

// ── isGeoreferenceAnnotation ──────────────────────────────────────────────────

describe("isGeoreferenceAnnotation", () => {
  it("returns true for a georeferencing annotation with a FeatureCollection body", () => {
    expect(isGeoreferenceAnnotation(GEOREF_ANNOTATION_CANVAS)).toBe(true);
  });

  it("accepts an array motivation that includes georeferencing", () => {
    expect(
      isGeoreferenceAnnotation({
        ...GEOREF_ANNOTATION_CANVAS,
        motivation: ["georeferencing"],
      }),
    ).toBe(true);
  });

  it("returns false for a painting annotation", () => {
    expect(
      isGeoreferenceAnnotation({
        type: "Annotation",
        motivation: "painting",
        body: { type: "Image" },
      }),
    ).toBe(false);
  });

  it("returns false for georeferencing without a FeatureCollection body", () => {
    expect(
      isGeoreferenceAnnotation({
        type: "Annotation",
        motivation: "georeferencing",
        body: { type: "TextualBody" },
      }),
    ).toBe(false);
  });

  it("returns false for nullish / non-object input", () => {
    expect(isGeoreferenceAnnotation(null)).toBe(false);
    expect(isGeoreferenceAnnotation(undefined)).toBe(false);
    expect(isGeoreferenceAnnotation("georeferencing")).toBe(false);
  });
});

// ── getImageServiceId ─────────────────────────────────────────────────────────

describe("getImageServiceId", () => {
  it("reads a Presentation 3 ImageService3 (id + type)", () => {
    expect(
      getImageServiceId({
        service: [
          { id: "https://iiif.example.org/image/3/x", type: "ImageService3" },
        ],
      }),
    ).toEqual({
      id: "https://iiif.example.org/image/3/x",
      type: "ImageService3",
    });
  });

  it("reads a Presentation 2 ImageService2 (@id + @type)", () => {
    expect(
      getImageServiceId({
        service: [
          {
            "@id": "https://iiif.example.org/image/2/x",
            "@type": "ImageService2",
          },
        ],
      }),
    ).toEqual({
      id: "https://iiif.example.org/image/2/x",
      type: "ImageService2",
    });
  });

  it("prefers an ImageService over an unrelated service", () => {
    expect(
      getImageServiceId({
        service: [
          { id: "https://iiif.example.org/search", type: "SearchService2" },
          { id: "https://iiif.example.org/image/2/x", type: "ImageService2" },
        ],
      }),
    ).toEqual({
      id: "https://iiif.example.org/image/2/x",
      type: "ImageService2",
    });
  });

  it("falls back to the first service id (assumes v2) when no type matches", () => {
    expect(
      getImageServiceId({
        service: [{ id: "https://iiif.example.org/image/x" }],
      }),
    ).toEqual({
      id: "https://iiif.example.org/image/x",
      type: "ImageService2",
    });
  });

  it("returns undefined when there is no service", () => {
    expect(getImageServiceId({})).toBeUndefined();
    expect(getImageServiceId({ service: [] })).toBeUndefined();
    expect(getImageServiceId(undefined)).toBeUndefined();
  });
});

// ── parseGeoreferenceAnnotation ───────────────────────────────────────────────

describe("parseGeoreferenceAnnotation", () => {
  it("extracts all three GCPs from the annotation fixture", () => {
    const gcps = parseGeoreferenceAnnotation(GEOREF_ANNOTATION_CANVAS);
    expect(gcps).toHaveLength(3);
    expect(gcps).toEqual(EXPECTED_GCPS);
  });

  it("assigns stable auto-generated ids when Feature has no id", () => {
    const gcps = parseGeoreferenceAnnotation(GEOREF_ANNOTATION_CANVAS);
    expect(gcps[0].id).toBe("gcp-0");
    expect(gcps[1].id).toBe("gcp-1");
    expect(gcps[2].id).toBe("gcp-2");
  });

  it("preserves floating-point precision in resourceCoords", () => {
    const gcps = parseGeoreferenceAnnotation(GEOREF_ANNOTATION_CANVAS);
    expect(gcps[0].resourceCoords).toEqual([577.7, 1074.97]);
    expect(gcps[1].resourceCoords).toEqual([3023.66, 1560.92]);
    expect(gcps[2].resourceCoords).toEqual([3499.96, 6785.6]);
  });

  it("preserves floating-point precision in geoCoords", () => {
    const gcps = parseGeoreferenceAnnotation(GEOREF_ANNOTATION_CANVAS);
    expect(gcps[0].geoCoords).toEqual([-87.71064, 42.06793]);
    expect(gcps[1].geoCoords).toEqual([-87.67961, 42.06283]);
    expect(gcps[2].geoCoords).toEqual([-87.6752, 42.01607]);
  });

  it("returns an empty array for null input", () => {
    expect(parseGeoreferenceAnnotation(null)).toEqual([]);
  });

  it("returns an empty array for undefined input", () => {
    expect(parseGeoreferenceAnnotation(undefined)).toEqual([]);
  });

  it("silently skips a Feature whose geometry is not a Point", () => {
    const annotation = {
      ...GEOREF_ANNOTATION_CANVAS,
      body: {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            properties: { resourceCoords: [100, 200] },
            geometry: {
              type: "Polygon" as const,
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
          },
          // Valid point follows
          GEOREF_ANNOTATION_CANVAS.body.features[0],
        ],
      },
    };
    const gcps = parseGeoreferenceAnnotation(annotation);
    expect(gcps).toHaveLength(1);
    expect(gcps[0].resourceCoords).toEqual([577.7, 1074.97]);
  });

  it("silently skips a Feature with missing resourceCoords", () => {
    const annotation = {
      ...GEOREF_ANNOTATION_CANVAS,
      body: {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            properties: {}, // no resourceCoords
            geometry: { type: "Point" as const, coordinates: [-87.7, 42.0] },
          },
        ],
      },
    };
    expect(parseGeoreferenceAnnotation(annotation)).toEqual([]);
  });

  it("silently skips a Feature with NaN coordinates", () => {
    const annotation = {
      ...GEOREF_ANNOTATION_CANVAS,
      body: {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            properties: { resourceCoords: ["x", "y"] },
            geometry: { type: "Point" as const, coordinates: [-87.7, 42.0] },
          },
        ],
      },
    };
    expect(parseGeoreferenceAnnotation(annotation)).toEqual([]);
  });

  it("uses an explicit Feature id when present", () => {
    const annotation = {
      ...GEOREF_ANNOTATION_CANVAS,
      body: {
        type: "FeatureCollection" as const,
        features: [
          {
            ...GEOREF_ANNOTATION_CANVAS.body.features[0],
            id: "https://example.edu/gcp/1",
          },
        ],
      },
    };
    const gcps = parseGeoreferenceAnnotation(annotation);
    expect(gcps[0].id).toBe("https://example.edu/gcp/1");
  });
});

// ── adaptGeoreferenceAnnotationForOverlay ─────────────────────────────────────

describe("adaptGeoreferenceAnnotationForOverlay", () => {
  it("swaps the Canvas source for an ImageService2 source", () => {
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      GEOREF_ANNOTATION_CANVAS,
      IMAGE_SERVICE_V2_ID,
    );
    expect(adapted.target.source).toEqual({
      id: IMAGE_SERVICE_V2_ID,
      type: "ImageService2",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    });
  });

  it("matches the expected IMAGE_SERVICE fixture exactly", () => {
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      GEOREF_ANNOTATION_CANVAS,
      IMAGE_SERVICE_V2_ID,
    );
    expect(adapted).toEqual(GEOREF_ANNOTATION_IMAGE_SERVICE);
  });

  it("preserves the original annotation's GCPs unchanged", () => {
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      GEOREF_ANNOTATION_CANVAS,
      IMAGE_SERVICE_V2_ID,
    );
    expect(adapted.body.features).toEqual(
      GEOREF_ANNOTATION_CANVAS.body.features,
    );
  });

  it("preserves the selector unchanged", () => {
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      GEOREF_ANNOTATION_CANVAS,
      IMAGE_SERVICE_V2_ID,
    );
    expect(adapted.target.selector).toEqual(
      GEOREF_ANNOTATION_CANVAS.target.selector,
    );
  });

  it("does not mutate the input annotation", () => {
    const clone = JSON.parse(JSON.stringify(GEOREF_ANNOTATION_CANVAS));
    adaptGeoreferenceAnnotationForOverlay(clone, IMAGE_SERVICE_V2_ID);
    expect(clone.target.source.type).toBe("Canvas");
    expect(clone.target.source.id).toBe(CANVAS_ID);
  });

  it("accepts ImageService3 as the service type", () => {
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      GEOREF_ANNOTATION_CANVAS,
      "https://iiif.example.edu/iiif/3/img-id",
      "ImageService3",
    );
    expect(adapted.target.source.type).toBe("ImageService3");
  });

  it("passes through undefined dimensions when the original source omitted them", () => {
    const noSize = {
      ...GEOREF_ANNOTATION_CANVAS,
      target: {
        ...GEOREF_ANNOTATION_CANVAS.target,
        source: { id: CANVAS_ID, type: "Canvas" },
      },
    };
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      noSize,
      IMAGE_SERVICE_V2_ID,
    );
    expect(adapted.target.source.width).toBeUndefined();
    expect(adapted.target.source.height).toBeUndefined();
  });

  it("GCPs remain parseable after adaptation", () => {
    const adapted = adaptGeoreferenceAnnotationForOverlay(
      GEOREF_ANNOTATION_CANVAS,
      IMAGE_SERVICE_V2_ID,
    );
    expect(parseGeoreferenceAnnotation(adapted)).toEqual(EXPECTED_GCPS);
  });
});

// ── normalizeNavPlace ─────────────────────────────────────────────────────────

describe("normalizeNavPlace", () => {
  it("returns a FeatureCollection unchanged", () => {
    const result = normalizeNavPlace(EXAMPLE_NAV_PLACE);
    expect(result).toBe(EXAMPLE_NAV_PLACE); // same reference
    expect(result?.type).toBe("FeatureCollection");
    expect(result?.features).toHaveLength(1);
  });

  it("wraps a single Feature in a FeatureCollection", () => {
    const result = normalizeNavPlace(EXAMPLE_NAV_PLACE_FEATURE);
    expect(result?.type).toBe("FeatureCollection");
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0]).toBe(EXAMPLE_NAV_PLACE_FEATURE);
  });

  it("wraps a bare Point geometry in a Feature + FeatureCollection", () => {
    const point: GeoJSON.Point = {
      type: "Point",
      coordinates: [-87.6881, 42.045],
    };
    const result = normalizeNavPlace(point);
    expect(result?.type).toBe("FeatureCollection");
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0].geometry).toEqual(point);
    expect(result?.features[0].properties).toEqual({});
  });

  it("wraps a bare Polygon geometry", () => {
    const polygon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    };
    const result = normalizeNavPlace(polygon);
    expect(result?.features[0].geometry).toEqual(polygon);
  });

  it("handles a FeatureCollection with a Polygon geometry", () => {
    const result = normalizeNavPlace(EXAMPLE_NAV_PLACE_POLYGON);
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0].geometry.type).toBe("Polygon");
  });

  it("returns null for null", () => {
    expect(normalizeNavPlace(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(normalizeNavPlace(undefined)).toBeNull();
  });

  it("returns null for a non-GeoJSON object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(normalizeNavPlace({ type: "Manifest" } as any)).toBeNull();
  });
});

// ── getNavPlaceLabel ──────────────────────────────────────────────────────────

describe("getNavPlaceLabel", () => {
  it("returns a plain string as-is", () => {
    expect(getNavPlaceLabel("Example Location")).toBe("Example Location");
  });

  it("extracts the first value from an IIIF InternationalString", () => {
    expect(getNavPlaceLabel({ en: ["Example Location"] })).toBe(
      "Example Location",
    );
  });

  it("handles a multi-language InternationalString", () => {
    const label = { en: ["Example"], fr: ["Exemple"] };
    const result = getNavPlaceLabel(label);
    expect(["Example", "Exemple"]).toContain(result);
  });

  it("extracts the label from a navPlace fixture feature", () => {
    const feature = EXAMPLE_NAV_PLACE.features[0];
    const label = feature.properties?.label as { en: string[] };
    expect(getNavPlaceLabel(label)).toBe("Example Location");
  });

  it("returns empty string for null", () => {
    expect(getNavPlaceLabel(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(getNavPlaceLabel(undefined)).toBe("");
  });

  it("returns empty string for an empty InternationalString", () => {
    expect(getNavPlaceLabel({})).toBe("");
  });

  it("returns empty string for an InternationalString with empty arrays", () => {
    expect(getNavPlaceLabel({ en: [] })).toBe("");
  });
});

// ── extractNavPlaceFeatures ───────────────────────────────────────────────────

describe("extractNavPlaceFeatures", () => {
  const manifest = {
    id: "https://example.org/iiif/manifest",
    type: "Manifest",
    label: { en: ["Example Manifest"] },
    summary: { en: ["Manifest summary"] },
    thumbnail: [{ id: "https://example.org/thumb.jpg", type: "Image" }],
    homepage: [{ id: "https://example.org/work", type: "Text" }],
    navPlace: EXAMPLE_NAV_PLACE,
    items: [
      {
        id: "https://example.org/iiif/canvas/1",
        type: "Canvas",
        label: { en: ["Canvas 1"] },
        navPlace: EXAMPLE_NAV_PLACE_FEATURE,
      },
    ],
  };

  it("enriches features with the IIIF resource that supplied navPlace", () => {
    const features = extractNavPlaceFeatures(manifest, {
      levels: ["Manifest"],
    });

    expect(features).toHaveLength(1);
    expect(features[0].properties?.iiifResource).toMatchObject({
      id: manifest.id,
      type: "Manifest",
      label: manifest.label,
      summary: manifest.summary,
      thumbnail: "https://example.org/thumb.jpg",
      homepage: "https://example.org/work",
    });
  });

  it("can extract canvas-level navPlace without manifest-level features", () => {
    const features = extractNavPlaceFeatures(manifest, { levels: ["Canvas"] });

    expect(features).toHaveLength(1);
    expect(features[0].properties?.iiifResource).toMatchObject({
      id: "https://example.org/iiif/canvas/1",
      type: "Canvas",
      label: { en: ["Canvas 1"] },
    });
    expect(features[0].properties?.iiifResource?.parent).toMatchObject({
      id: manifest.id,
      type: "Manifest",
    });
  });

  it("creates a FeatureCollection from extracted features", () => {
    const features = extractNavPlaceFeatures(manifest);
    const collection = createNavPlaceFeatureCollection(features);

    expect(collection).toEqual({
      type: "FeatureCollection",
      features,
    });
  });
});
