import {
  Annotation,
  AnnotationPageNormalized,
  Canvas,
  CanvasNormalized,
  ContentResource,
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

      let annotationBody = annotation.body as
        | ContentResource
        | ContentResource[];

      if (Array.isArray(annotationBody)) annotationBody = annotationBody[0];

      // console.log("annotationBody", annotationBody);

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
          return !!annotation;
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

  /**
   * get all annotations on an annotation page resource
   * and add them to the annotations array on the canvas entity
   */
  if (entity.annotationPage) {
    /**
     * get all initial annotation page resources
     */
    const annotationPageResources = vault
      .get(entity.annotationPage.items)
      .map((item) => {
        return {
          body: vault.get(item.body[0].id),
          motivation: item.motivation,
          type: "Annotation",
        };
      });

    const annotations: Annotation[] = [];
    annotationPageResources.forEach((annotation) => {
      /**
       * determine if type is a choice of multiple annotations
       * if so, add each annotation to the annotations array
       */
      if (annotation.body.type === "Choice") {
        annotation.body.items.forEach((item) =>
          annotations.push({
            ...annotation,
            id: item.id,
            body: vault.get(item.id),
          }),
        );

        /**
         * if not, add the single annotation to the annotations array
         */
      } else {
        annotations.push(annotation);
      }
    });

    /**
     * filter annotations and scrub invalid annotations
     */
    entity.annotations = annotations.filter(filterAnnotations);
  }

  return entity;
};
