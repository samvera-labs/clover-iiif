import {
  Annotation,
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

interface NormalizedByCriteria {
  canvas: CanvasNormalized | undefined;
  annotationPage: AnnotationPageNormalized | undefined;
  annotations: Array<Annotation> | undefined;
  contentResources: Array<ContentResource> | undefined;
}

export const getNormalizedByCritera = (
  vault: object,
  item: object,
  annotationMotivation: string,
  contentResourceType: Array<string>,
) => {
  const normalized: NormalizedByCriteria = {
    canvas: undefined,
    annotationPage: undefined,
    annotations: undefined,
    contentResources: undefined,
  };

  const filterAnnotations = (annotation, index) => {
    if (annotation.motivation.includes(annotationMotivation)) {
      annotation.body = vault.allFromRef(annotation.body);
      console.log(annotation.body[0].type);
      if (contentResourceType.includes(annotation.body[0].type))
        return annotation;
    }
  };

  normalized.canvas = vault.fromRef(item);
  normalized.annotationPage = vault.fromRef(normalized.canvas.items[0]);

  normalized.annotations = vault
    .allFromRef(normalized.annotationPage.items)
    .filter(filterAnnotations);

  console.log(normalized);

  return normalized;
};
