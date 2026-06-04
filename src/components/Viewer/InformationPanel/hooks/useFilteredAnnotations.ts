import { useMemo } from "react";
import { Vault } from "@iiif/helpers/vault";
import { AnnotationResources } from "src/types/annotations";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { annotationMatchesMotivations } from "src/lib/annotation-helpers";

/**
 * Filters annotation resources by allowed motivations.
 * Returns the original resources if no motivations are specified.
 */
export function useFilteredAnnotations({
  annotationResources,
  allowedMotivations,
  vault,
}: {
  annotationResources?: AnnotationResources;
  allowedMotivations?: string[];
  vault: Vault;
}): AnnotationResources {
  return useMemo(() => {
    if (!annotationResources) return [];
    if (!allowedMotivations) return annotationResources;

    return annotationResources
      .map((annotationPage) => {
        if (!annotationPage?.items?.length) return null;

        const filteredItems = annotationPage.items.filter((item) => {
          const annotation = vault.get(item.id) as
            | AnnotationNormalized
            | undefined;
          return annotationMatchesMotivations(
            annotation,
            allowedMotivations,
          );
        });

        if (!filteredItems.length) return null;

        return {
          ...annotationPage,
          items: filteredItems,
        };
      })
      .filter(Boolean) as AnnotationResources;
  }, [annotationResources, allowedMotivations, vault]);
}
