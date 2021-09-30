import {
  Annotation,
  AnnotationPageNormalized,
  Canvas,
  CanvasNormalized,
  InternationalString,
} from "@hyperion-framework/types";

// Get string from a IIIF pres 3 label by language code
export const getLabel = (
  label: InternationalString,
  language: string = "en",
) => {
  return label[language];
};

interface CanvasEntity {
  canvas: CanvasNormalized | undefined;
  annotationPage: AnnotationPageNormalized | undefined;
  annotations: Array<Annotation> | undefined;
}

export const getCanvasByCriteria = (
  vault: object,
  item: Canvas,
  motivation: string,
  paintingType: Array<string>,
) => {
  const entity: CanvasEntity = {
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

  entity.canvas = vault.fromRef(item);
  entity.annotationPage = vault.fromRef(entity.canvas.items[0]);

  entity.annotations = vault
    .allFromRef(entity.annotationPage.items)
    .filter(filterAnnotations);

  if (entity.annotations.length > 0) return entity;
};
