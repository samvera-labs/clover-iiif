// import {
//   Annotation,
//   W3CAnnotationBody,
//   EmbeddedResource,
// } from "@iiif/presentation-3";

// annotations that are produced by Annotorious
export type AnnotationFromAnnotorious = {
  "@context": "http://www.w3.org/ns/anno.jsonld";
  type: "Annotation";
  body: AnnotationBodyAnnotorious[];
  target: {
    source: string;
    selector: {
      type: "FragmentSelector";
      conformsTo: "http://www.w3.org/TR/media-frags/";
      value: string;
    };
  };
  id: string;
};

export type AnnotationBodyAnnotorious = {
  type: "TextualBody" | "Image";
  value: string;
  purpose: "commenting";
};

// annotations this plugin sends to Annotorious
export type AnnotationForAnnotorious = {
  "@context": "http://www.w3.org/ns/anno.jsonld";
  type: "Annotation";
  body: AnnotationBodyAnnotorious[];
  target: {
    source: {
      id: string;
      type: "Canvas";
      partOf: [
        {
          id: string;
          type: "Manifest";
        },
      ];
    };
    selector: {
      type: "FragmentSelector";
      conformsTo: "http://www.w3.org/TR/media-frags/";
      value: string;
    };
  };
  id: string;
};

export type AnnotationPageForEditor = {
  "@context": "http://iiif.io/api/presentation/3/context.json";
  id: string;
  type: "AnnotationPage";
  items: AnnotationForEditor[];
};

export type AnnotationForEditor = {
  type: "Annotation";
  body?: AnnotationBodyForEditor[] | AnnotationBodyForEditor;
  motivation: "commenting";
  target: {
    type: "SpecificResource";
    source: {
      id: string;
      type: "Canvas";
      partOf: [
        {
          id: string;
          type: "Manifest";
        },
      ];
    };
    selector: {
      type: "FragmentSelector";
      conformsTo: "http://www.w3.org/TR/media-frags/";
      value: string;
    };
  };
  id: string;
};

export type AnnotationBodyForEditor = AnnotationBodyText | AnnotationBodyImage;

type AnnotationBodyText = {
  type: "TextualBody";
  value: string;
  format: "text/plain";
};
type AnnotationBodyImage = {
  type: "Image";
  value: string;
  format: string;
};
