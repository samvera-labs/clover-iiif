import { AnnotationResources } from "src/types/annotations";
import { CanvasNormalized } from "@iiif/presentation-3";

export type FormattedAnnotationItem = {
  [k: string]: any;
};

export const getAnnotationResources = async (
  vault: any,
  activeCanvas: string,
): Promise<AnnotationResources> => {
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  if (!canvas?.annotations || !canvas.annotations[0]) return [];

  const annotationPages: AnnotationResources = vault.get(canvas.annotations);

  /**
   * Filter out annotation pages that don't have any Annotations in the items array.
   */
  const filteredPages = annotationPages.filter((annotationPage) => {
    if (!annotationPage.items) return false;
    return annotationPage;
  });

  const pages: AnnotationResources = [];
  for (const annotationPage of filteredPages) {
    // handle embedded annotations
    if (annotationPage.items.length > 0) {
      const label = annotationPage.label || { none: ["Annotations"] };
      pages.push({ ...annotationPage, label: label });
      // handle referenced annotations that are in a separate AnnotationPage
    } else {
      const annotationPageReferenced = await vault.load(annotationPage.id);
      if (
        annotationPageReferenced.items &&
        annotationPageReferenced.items.length > 0
      ) {
        const label = annotationPageReferenced.label || {
          none: ["Annotations"],
        };
        pages.push({ ...annotationPageReferenced, label: label });
      }
    }
  }
  return pages;
};
