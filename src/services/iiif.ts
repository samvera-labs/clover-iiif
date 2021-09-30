import {
  Annotation,
  AnnotationPageNormalized,
  Canvas,
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

interface CanvasEntities {
  canvas: CanvasNormalized | undefined;
  annotationPage: AnnotationPageNormalized | undefined;
  annotations: Array<Annotation> | undefined;
}

export const getCanvasEntities = (
  vault: object,
  item: Canvas,
  motivation: string,
  paintingType: Array<string>,
) => {
  const normalized: CanvasEntities = {
    canvas: undefined,
    annotationPage: undefined,
    annotations: undefined,
  };

  const filterAnnotations = (annotation: Annotation) => {
    annotation.body = vault.allFromRef(annotation.body);
    switch (motivation) {
      case "painting":
        if (
          annotation.target === item.id &&
          annotation.motivation[0] === "painting" &&
          paintingType.includes(annotation.body[0].type)
        )
          return annotation;
        break;
      default: {
        throw new Error(`Invalid annotation motivation.`);
      }
    }
  };

  normalized.canvas = vault.fromRef(item);
  normalized.annotationPage = vault.fromRef(normalized.canvas.items[0]);

  normalized.annotations = vault
    .allFromRef(normalized.annotationPage.items)
    .filter(filterAnnotations);

  if (normalized.annotations.length > 0) return normalized;
};
