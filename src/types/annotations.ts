import {
  Annotation,
  AnnotationPageNormalized,
  EmbeddedResource,
  InternationalString,
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

type FormattedAnnotationItem = {
  [k: string]: any;
};

type SearchContentResources = {
  id: string;
  label: InternationalString;
  motivation: string | undefined;
  items: { [k: string]: FormattedAnnotationItem[] };
};

export type {
  AnnotationFlattened,
  AnnotationResources,
  ParsedAnnotationTarget,
  SearchContentResources,
};
