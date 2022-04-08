import {
  Annotation,
  AnnotationPage,
  CanvasNormalized,
  ContentResource,
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

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
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  if (!canvas?.annotations || !canvas.annotations[0]) return [];

  const annotationPage: AnnotationPage = vault.get(canvas.annotations[0]);

  const annotations: Annotation[] = vault.get(annotationPage.items);
  if (!Array.isArray(annotations)) return [];

  return annotations
    .filter((annotation) => {
      if (!annotation.body) return;
      if (annotation.motivation?.includes("supplementing")) {
        let annotationBody = annotation.body as
          | ContentResource
          | ContentResource[];

        if (Array.isArray(annotationBody)) annotationBody = annotationBody[0];

        const resource: IIIFExternalWebResource = vault.get(annotationBody.id);
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
