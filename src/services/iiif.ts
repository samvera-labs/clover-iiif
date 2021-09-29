import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  ContentResource,
  InternationalString,
} from "@hyperion-framework/types";

// Get string from a IIIF pres 3 label by language code
export const getLabel = (
  label: InternationalString,
  language: string = "en",
) => {
  return label[language];
};

export const getCanvasByAnnotation = (
  vault: object,
  item: object,
  annotationMotivation: string,
  contentResourceType: Array<string>,
) => {
  const canvas: CanvasNormalized = vault.fromRef(item);

  const annotationPage: AnnotationPageNormalized = vault.fromRef(
    canvas.items[0],
  );

  const annotations: Array<AnnotationNormalized> = vault.allFromRef(
    annotationPage.items,
  );

  for (const annotation of annotations) {
    if (annotation.motivation.includes(annotationMotivation)) {
      const contentResource: ContentResource = vault.fromRef(
        annotation.body[0],
      );

      if (
        annotation.target === item.id &&
        contentResourceType.includes(contentResource.type)
      )
        return {
          canvas: canvas,
          annotations: [annotation],
          contentResource: contentResource,
        };
    }
  }
};
