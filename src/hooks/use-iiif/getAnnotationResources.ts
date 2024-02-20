import {
  AnnotationResources,
  SearchContentResources,
} from "src/types/annotations";
import {
  Annotation,
  AnnotationBody,
  AnnotationPage,
  CanvasNormalized,
  ContentResource,
} from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";

export const getAnnotationResources = (
  vault: any,
  activeCanvas: string,
): AnnotationResources => {
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  if (!canvas?.annotations || !canvas.annotations[0]) return [];

  const annotationPages: AnnotationResources = vault.get(canvas.annotations);

  /**
   * Filter out annotation pages that don't have any Annotations in the items array.
   */
  return annotationPages
    .filter((annotationPage) => {
      if (!annotationPage.items || !annotationPage.items.length) return false;
      return annotationPage;
    })
    .map((annotationPage) => {
      /**
       * If the annotation page doesn't have a label, add a default label.
       * Set this value in a CONFIG and not here.
       */
      const label = annotationPage.label || { none: ["Annotations"] };
      return { ...annotationPage, label };
    });
};

export const getContentSearchResources = async (
  annotationPage: AnnotationPage,
  canvasLabelObj: { [k: string]: string },
): Promise<SearchContentResources> => {
  if (annotationPage["@context"] !== "http://iiif.io/api/search/2/context.json")
    return {} as SearchContentResources;
  if (!annotationPage.items) return {} as SearchContentResources;

  const vault = new Vault();
  await vault.loadManifest(annotationPage);
  const annotations: Annotation[] = vault.get(annotationPage.items);

  annotations.forEach((annotation) => {
    if (!annotation.body) return;

    const annotationBody = annotation.body as ContentResource[];
    if (Array.isArray(annotationBody)) {
      if (annotationBody.length === 1) {
        const resource = vault.get(annotationBody[0]) as AnnotationBody;
        annotation.body = resource;
      }
    }
  });

  const data = {
    id: "Search Results",
    label: { en: ["Search Results"] },
    motivation: annotations[0].motivation && annotations[0].motivation[0],
    items: {},
  };

  annotations.forEach((annotation) => {
    const target = annotation.target;
    if (target && typeof target === "string") {
      const canvasId = Object.keys(canvasLabelObj).find((canvasId) =>
        target.startsWith(canvasId),
      );
      if (canvasId) {
        if (!data.items[canvasLabelObj[canvasId]]) {
          data.items[canvasLabelObj[canvasId]] = [];
        }
        data.items[canvasLabelObj[canvasId]].push({
          target: annotation.target,
          body: annotation.body,
          canvas: canvasId,
        });
      }
    }
  });

  return data;
};
