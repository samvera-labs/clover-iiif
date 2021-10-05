import {
  Annotation,
  AnnotationPageNormalized,
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
  IIIFExternalWebResource,
  InternationalString,
} from "@hyperion-framework/types";

// Get string from a IIIF pres 3 label by language code
export const getLabel = (
  label: InternationalString,
  language: string = "en",
) => {
  return label[language];
};

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

export const getThumbnail = (
  vault: any,
  entity: CanvasEntity,
  width: number,
  height: number,
) => {
  /*
   * 1. Initiate empty candidates array.
   */
  let candidates: Array<IIIFExternalWebResource> = [];

  /*
   * 2. Check if canvas has an explicitly assigned IIIF thumbnail.
   */
  if (entity.canvas)
    if (entity.canvas.thumbnail.length > 0) {
      const canvasThumbnail: IIIFExternalWebResource = vault.fromRef(
        entity.canvas.thumbnail[0],
      );
      candidates.push(canvasThumbnail);
    }

  if (entity.annotations[0]) {
    /*
     * 2. Check if painting annotation has an explicitly assigned IIIF thumbnail.
     */
    if (entity.annotations[0].thumbnail)
      if (entity.annotations[0].thumbnail.length > 0) {
        const annotationThumbnail: IIIFExternalWebResource = vault.fromRef(
          entity.annotations[0].thumbnail[0],
        );
        candidates.push(annotationThumbnail);
      }

    /*
     * 3. Check if painting annotation is of type Image.
     */
    const resources: IIIFExternalWebResource[] = vault.allFromRef(
      entity.annotations[0].body,
    );
    if (resources[0].type === "Image") candidates.push(resources[0]);
  }

  /*
   * 4. Validate candidates and make selection.
   *
   *    (WIP)
   *
   */

  const selectedCandidate: IIIFExternalWebResource = {
    id: candidates[0].id,
    format: candidates[0].format,
    type: candidates[0].type,
    width: width,
    height: height,
  };

  /*
   * 5. Return (for time being crudely) constructed image object.
   */
  const thumbnailContent = selectedCandidate;

  return thumbnailContent;
};
