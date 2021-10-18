import {
  Annotation,
  AnnotationPage,
  CanvasNormalized,
  InternationalString,
} from "@hyperion-framework/types";

export interface LabeledResource {
  id?: string;
  type: "Dataset" | "Image" | "Video" | "Sound" | "Text";
  format?: string;
  label: InternationalString;
  language?: string | string[];
  processingLanguage?: string;
  textDirection?: "ltr" | "rtl" | "auto";
}

// Get webVtt annotations from activeCanvas
export const getSupplementingResources = (
  vault: any,
  activeCanvas: string,
  format: string,
): Array<LabeledResource> => {
  const canvas: CanvasNormalized = vault.fromRef({
    id: activeCanvas,
    type: "Canvas",
  });

  const annotationPage: AnnotationPage = vault.fromRef(canvas.annotations[0]);

  const annotations: Annotation[] = vault.allFromRef(annotationPage.items);

  if (!Array.isArray(annotations)) return [];

  return annotations
    .filter((annotation) => {
      if (annotation.motivation === "supplementing") {
        const resource: LabeledResource = vault.fromRef(annotation.body);
        if (resource.format === format) {
          annotation.body = resource;
          return annotation;
        }
      }
    })
    .map((filtered: Annotation) => {
      return filtered.body as LabeledResource;
    });
};
