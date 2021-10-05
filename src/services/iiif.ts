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

export interface CanvasEntity {
  canvas: CanvasNormalized | undefined;
  annotationPage: AnnotationPageNormalized | undefined;
  annotations: Array<Annotation | undefined>;
}

export const getCanvasByCriteria = (
  vault: object,
  item: Canvas,
  motivation: string,
  paintingType: Array<string>,
): CanvasEntity => {
  const entity: CanvasEntity = {
    canvas: undefined,
    annotationPage: undefined,
    annotations: [],
  };

  const filterAnnotations = (annotation: Annotation) => {
    annotation.body = vault.allFromRef(annotation.body);
    switch (motivation) {
      case "painting":
        if (
          annotation.target === item.id &&
          annotation.motivation &&
          annotation.motivation[0] === "painting" &&
          paintingType.includes(annotation.body[0].type)
        )
          return annotation;
        break;
      case "supplementing":
        return;
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

  return entity;
};

export const getThumbnail = (vault, entity, width, height) => {
  /*
   * 1. Initiate empty candidates array.
   */
  let candidates: Array<object> | null = [];

  /*
   * 2. Check if canvas has an explicitly assigned IIIF thumbnail.
   */
  if (entity.canvas.thumbnail.length > 0) {
    const canvasThumbnail: ContentResource = vault.fromRef(
      entity.canvas.thumbnail[0],
    );
    candidates.push(canvasThumbnail);
  }

  /*
   * 2. Check if painting annotation has an explicitly assigned IIIF thumbnail.
   */
  if (entity.annotations[0].thumbnail) {
    if (entity.annotations[0].thumbnail.length > 0) {
      const annotationThumbnail: ContentResource = vault.fromRef(
        entity.annotations[0].thumbnail[0],
      );
      candidates.push(annotationThumbnail);
    }
  }

  /*
   * 3. Check if painting annotation is of type Image.
   */
  if (entity.annotations[0].body[0].type === "Image") {
    candidates.push(entity.annotations[0].body[0]);
  }

  /*
   * 4. Validate candidates and make selection.
   *
   *    (WIP)
   *
   */

  const selectedCandidate: object = {
    src: candidates[0].id,
    format: candidates[0].format,
  };

  /*
   * 5. Return (for time being crudely) constructed image object.
   */
  const thumbnailContent: object = {
    src: selectedCandidate.src,
    width: width,
    height: height,
    format: selectedCandidate.format,
  };

  return thumbnailContent;
};
