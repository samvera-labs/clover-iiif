import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import { CanvasNormalized } from "@iiif/presentation-3";

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
  contentSearchVault: any,
  searchUrl: string,
): Promise<AnnotationResource> => {
  let annotationPage;
  try {
    annotationPage = await contentSearchVault.load(searchUrl);
  } catch (error) {
    console.log("Could not load content search.");
    return {} as AnnotationResource;
  }

  if (annotationPage.label == undefined) {
    annotationPage.label = { none: ["Search Results"] };
  }
  return annotationPage;
};
