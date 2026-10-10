import { p4 } from "./presentation4";

/**
 * A real georeference, for the map: Northwestern University Libraries' scan of the "Map of
 * the Township of Evanston, Cook County, Illinois" (FileSet 2fb1e81a), with the control
 * points its Meadow authoring tool stored. Copied from 3.x's `src/fixtures/georef.ts`.
 */

/** The Canvas the annotation targets. */
export const DC_CANVAS_ID =
  "https://api.dc.library.northwestern.edu/api/v2/file-sets/2fb1e81a-9e24-420c-b224-0bfd6a279baf?as=iiif";

/** Its image service (level 2, 7337 × 9833, CORS open). */
export const DC_IMAGE_SERVICE_V3_ID =
  "https://iiif.dc.library.northwestern.edu/iiif/3/2fb1e81a-9e24-420c-b224-0bfd6a279baf";

export const CANVAS_WIDTH = 7337;
export const CANVAS_HEIGHT = 9833;

/** As stored: the Canvas as its source, the whole image as its mask. */
export const DC_GEOREF_ANNOTATION_CANVAS = {
  "@context": [
    "http://iiif.io/api/extension/georef/1/context.json",
    "http://iiif.io/api/presentation/3/context.json",
  ],
  id: "urn:meadow:georeference:2fb1e81a-9e24-420c-b224-0bfd6a279baf:2026-05-21T19%3A22%3A19.291Z",
  type: "Annotation",
  motivation: "georeferencing",
  target: {
    type: "SpecificResource",
    source: {
      id: DC_CANVAS_ID,
      type: "Canvas",
      height: CANVAS_HEIGHT,
      width: CANVAS_WIDTH,
    },
    selector: {
      type: "SvgSelector",
      value: `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"><polygon points="0,0 ${CANVAS_WIDTH},0 ${CANVAS_WIDTH},${CANVAS_HEIGHT} 0,${CANVAS_HEIGHT}" /></svg>`,
    },
  },
  body: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { confidence: "medium", resourceCoords: [577.7, 1074.97] },
        geometry: { type: "Point", coordinates: [-87.71064, 42.06793] },
      },
      {
        type: "Feature",
        properties: {
          confidence: "medium",
          resourceCoords: [3023.66, 1560.92],
        },
        geometry: { type: "Point", coordinates: [-87.67961, 42.06283] },
      },
      {
        type: "Feature",
        properties: { confidence: "medium", resourceCoords: [3499.96, 6785.6] },
        geometry: { type: "Point", coordinates: [-87.6752, 42.01607] },
      },
    ],
  },
};

/** A Manifest of the Evanston map: its Canvas, image service and stored georeference. */
export const evanston = () =>
  p4({
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/evanston",
    type: "Manifest",
    label: { en: ["Map of the Township of Evanston"] },
    items: [
      {
        id: DC_CANVAS_ID,
        type: "Canvas",
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        items: [
          {
            id: `${DC_CANVAS_ID}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${DC_CANVAS_ID}/page/image`,
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: `${DC_IMAGE_SERVICE_V3_ID}/full/max/0/default.jpg`,
                  type: "Image",
                  format: "image/jpeg",
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  service: [
                    {
                      id: DC_IMAGE_SERVICE_V3_ID,
                      type: "ImageService3",
                      profile: "level2",
                    },
                  ],
                },
                target: DC_CANVAS_ID,
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://example.org/evanston/georef",
            type: "AnnotationPage",
            items: [DC_GEOREF_ANNOTATION_CANVAS],
          },
        ],
      },
    ],
  });
