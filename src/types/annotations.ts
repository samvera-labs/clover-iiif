import {
  Annotation,
  AnnotationPageNormalized,
  EmbeddedResource,
} from "@iiif/presentation-3";

type AnnotationResources = AnnotationPageNormalized[];
type AnnotationResource = AnnotationPageNormalized;

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

type ContentSearchQuery = {
  q: string;
  motivation?: string;
  date?: string;
  user?: string;
};

export type {
  AnnotationFlattened,
  AnnotationResources,
  AnnotationResource,
  ParsedAnnotationTarget,
  ContentSearchQuery,
};
