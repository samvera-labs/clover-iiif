import { AnnotationPageNormalized } from "@iiif/presentation-3";

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

export type { AnnotationResources, ParsedAnnotationTarget };
