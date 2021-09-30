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

interface NormalizedData {
  canvas: CanvasNormalized | undefined;
  annotationPage: AnnotationPageNormalized | undefined;
  annotations: Array<Annotation> | undefined;
}

export const getNormalizedByCritera = (
  vault: object,
  item: Canvas,
  motivation: string,
  paintingType: Array<string>,
) => {
  const normalized: NormalizedData = {
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

  return reconstructedCanvas(normalized);
};

export const reconstructedCanvas = (normalizedData: NormalizedData) => {
  if (normalizedData.annotations.length > 0) return normalizedData;
};
