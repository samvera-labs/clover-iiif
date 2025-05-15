import { AnnotationNormalized } from "@iiif/presentation-3";

export const contentStateSpecificResource: AnnotationNormalized = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://example.org/iiif/content-state/specific-resource",
  type: "Annotation",
  motivation: ["contentState"],
  target: {
    type: "SpecificResource",
    source: {
      id: "https://example.org/iiif/manifest/canvas/0",
      type: "Canvas",
      partOf: [
        {
          id: "https://example.org/iiif/manifest",
          type: "Manifest",
        },
      ],
    },
  },
  body: [],
};
