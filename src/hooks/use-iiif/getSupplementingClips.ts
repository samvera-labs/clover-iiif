import {
  Annotation,
  AnnotationPage,
  CanvasNormalized,
  ContentResource,
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

export interface LabeledClip {
  id?: string;
  type: "Dataset" | "Image" | "Video" | "Sound" | "Text";
  format?: string;
  label: InternationalString;
  language?: string | string[];
  processingLanguage?: string;
  textDirection?: "ltr" | "rtl" | "auto";
}

// Get json annotations from activeCanvas
export const getSupplementingClips = (
  vault: any,
  activeCanvas: string,
  format: string
): Array<LabeledClip> => {
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  if (!canvas?.annotations || !canvas.annotations[0]) return [];

  let clips: LabeledClip[] = [];
  canvas.annotations.forEach((annotation) => {
    const annotationPage: AnnotationPage = vault.get(annotation);
    const annotations: Annotation[] = vault.get(annotationPage.items);
    if (!Array.isArray(annotations)) return [];

    annotations.filter((annotation) => {
      if (!annotation.body) return;
      if (annotation.motivation?.includes("supplementing")) {
        let annotationBody = annotation.body as
          | ContentResource
          | ContentResource[];

        if (Array.isArray(annotationBody)) annotationBody = annotationBody[0];

        const clip: IIIFExternalWebResource = vault.get(annotationBody.id);
        if (clip.format === format) {
          clips.push(clip as LabeledClip);
        }
      }
    });
  });

  return clips;
};
