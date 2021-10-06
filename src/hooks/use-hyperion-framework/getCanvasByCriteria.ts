import {
  Annotation,
  AnnotationPageNormalized,
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
  IIIFExternalWebResource,
} from "@hyperion-framework/types";

export interface CanvasEntity {
  canvas: CanvasNormalized | undefined;
  annotationPage: AnnotationPageNormalized | undefined;
  annotations: Array<Annotation | undefined>;
}

export const getCanvasByCriteria = (
  vault: any,
  item: Canvas,
  motivation: string,
  paintingType: Array<ExternalResourceTypes>,
): CanvasEntity => {
  const entity: CanvasEntity = {
    canvas: undefined,
    annotationPage: undefined,
    annotations: [],
  };

  const filterAnnotations = (annotation: Annotation) => {
    if (annotation) {
      const resources: IIIFExternalWebResource[] = vault.allFromRef(
        annotation.body,
      );
      switch (motivation) {
        case "painting":
          if (
            annotation.target === item.id &&
            annotation.motivation &&
            annotation.motivation[0] === "painting" &&
            paintingType.includes(resources[0].type)
          )
            annotation.body = resources;
          return annotation;
        case "supplementing":
          return;
        default: {
          throw new Error(`Invalid annotation motivation.`);
        }
      }
    }
  };

  entity.canvas = vault.fromRef(item);

  if (entity.canvas)
    entity.annotationPage = vault.fromRef(entity.canvas.items[0]);

  if (entity.annotationPage)
    entity.annotations = vault
      .allFromRef(entity.annotationPage.items)
      .filter(filterAnnotations);

  return entity;
};
