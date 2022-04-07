import {
  Annotation,
  AnnotationBody,
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

      if (!annotation.body) return;

      let annotationBody: AnnotationBody | AnnotationBody[] = annotation.body;

      if (Array.isArray(annotationBody)) annotationBody = annotationBody[0];

      const resource: IIIFExternalWebResource = vault.get(annotationBody.id);
      if (!resource) return;
      switch (motivation) {
        case "painting":
          if (
            annotation.target === item.id &&
            annotation.motivation &&
            annotation.motivation[0] === "painting" &&
            paintingType.includes(resource.type)
          )
            annotation.body = resource;
          return annotation;
        case "supplementing":
          return;
        default: {
          throw new Error(`Invalid annotation motivation.`);
        }
      }
    }
  };

  entity.canvas = vault.get(item);

  if (entity.canvas) {
    entity.annotationPage = vault.get(entity.canvas.items[0]);
    entity.accompanyingCanvas = entity.canvas?.accompanyingCanvas
      ? vault.get(entity.canvas?.accompanyingCanvas)
      : undefined;
  }

  if (entity.annotationPage)
    entity.annotations = vault
      .get(entity.annotationPage.items)
      .filter(filterAnnotations);

  return entity;
};
