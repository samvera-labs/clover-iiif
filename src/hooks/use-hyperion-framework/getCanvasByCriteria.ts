import {
  Annotation,
  AnnotationPageNormalized,
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";

export interface CanvasEntity {
  canvas: CanvasNormalized | undefined;
  accompanyingCanvas: Canvas | undefined;
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
    accompanyingCanvas: undefined,
    annotationPage: undefined,
    annotations: [],
  };

  const filterAnnotations = (annotation: Annotation) => {
    if (annotation) {
      // Handle invalid annotations
      if (!annotation.body || !annotation.motivation) {
        console.error(
          `Invalid annotation after Hyperion parsing: missing either 'body' or 'motivation'`,
          annotation,
        );
        return;
      }

      // TODO: Upstream bug fix: Return some type of value here, even undefined?
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

  if (entity.canvas) {
    entity.annotationPage = vault.fromRef(entity.canvas.items[0]);
    entity.accompanyingCanvas = entity.canvas?.accompanyingCanvas
      ? vault.fromRef(entity.canvas?.accompanyingCanvas)
      : undefined;
  }

  if (entity.annotationPage)
    entity.annotations = vault
      .allFromRef(entity.annotationPage.items)
      .filter(filterAnnotations);

  return entity;
};
