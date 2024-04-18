import {
  Annotation,
  AnnotationPageNormalized,
  EmbeddedResource,
} from "@iiif/presentation-3";

type AnnotationResources = AnnotationPageNormalized[];

interface ParsedAnnotationTarget {
  id: string;
  point?: {
    x: number;
    y: number;
  };
  rect?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  svg?: string;
  t?: string;
}

interface AnnotationFlattened extends Annotation {
  body: EmbeddedResource;
}

export type {
  AnnotationFlattened,
  AnnotationResources,
  ParsedAnnotationTarget,
};
