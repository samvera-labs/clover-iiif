import { InternationalString } from "@iiif/presentation-3";

export type AnnotationBodyRaw = {
  type: string;
  value?: string;
  format?: string;
  language?: string;
  label?: InternationalString;
  id?: string;
};

export type AnnotationTargetRaw =
  | string
  | {
      type?: string;
      id?: string;
      source?:
        | string
        | {
            id: string;
            type: string;
            partOf?: Array<{ id: string; type: string }>;
          };
      selector?: {
        type: string;
        value?: string;
        conformsTo?: string;
      };
      partOf?: Array<{ id: string; type: string }>;
    };

export type AnnotationRaw = {
  id: string;
  type: "Annotation";
  motivation: string | string[];
  body: AnnotationBodyRaw | AnnotationBodyRaw[];
  target: AnnotationTargetRaw;
};

export type AnnotationPageRaw = {
  id: string;
  type: "AnnotationPage";
  startIndex?: number;
  next?: string;
  items: AnnotationRaw[];
};

export type AnnotationCollectionNormalized = {
  id: string;
  type: "AnnotationCollection";
  label?: InternationalString;
  total?: number;
  pages: AnnotationPageRaw[];
};
