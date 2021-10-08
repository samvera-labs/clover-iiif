import {
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
export const getContentResourcesByCriteria = (
  vault: any,
  activeCanvas: string,
  motivation: string,
  format: string,
): Array<LabeledResource> => {
  const canvas: CanvasNormalized = vault.fromRef({
    id: activeCanvas,
    type: "Canvas",
  });

  const annotationPage: AnnotationPage = vault.fromRef(canvas.items[0]);
  const annotations: AnnotationPage = vault.allFromRef(annotationPage.items);

  if (!Array.isArray(annotations)) return [];

  return annotations
    .filter((annotation) => {
      if (annotation.motivation[0] === motivation) {
        annotation.body[0] = vault.fromRef(annotation.body[0]);
        if (annotation.body[0].format === format) return annotation;
      }
    })
    .map((filtered) => {
      return filtered.body[0];
    });
};
