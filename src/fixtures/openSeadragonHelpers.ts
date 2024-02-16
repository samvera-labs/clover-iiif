import { CanvasNormalized } from "@iiif/presentation-3";
import { ParsedAnnotationTarget } from "src/types/annotations";

export const openSeadragonHelpersCanvas: CanvasNormalized = {
  id: "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1",
  type: "Canvas",
  label: null,
  behavior: [],
  motivation: null,
  thumbnail: [],
  posterCanvas: null,
  accompanyingCanvas: null,
  placeholderCanvas: null,
  summary: null,
  requiredStatement: null,
  metadata: [],
  rights: null,
  navDate: null,
  provider: [],
  items: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0021-tagging/page/p1/1",
      type: "AnnotationPage",
    },
  ],
  annotations: [
    {
      id: "https://iiif.io/api/cookbook/recipe/0021-tagging/page/p2/1",
      type: "AnnotationPage",
    },
  ],
  seeAlso: [],
  homepage: [],
  logo: [],
  partOf: [],
  rendering: [],
  service: [],
  duration: 0,
  height: 3024,
  width: 4032,
};

export const openSeadragonHelpersRect: ParsedAnnotationTarget = {
  id: "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1",
  rect: {
    x: 265,
    y: 661,
    w: 1260,
    h: 1239,
  },
};

export const openSeadragonHelpersPoint: ParsedAnnotationTarget = {
  id: "https://iiif.io/api/cookbook/recipe/0021-tagging/canvas/p1",
  point: {
    x: 500,
    y: 700,
  },
};
