import { useMemo } from "react";
import { getAvailableTabs } from "src/lib/information-panel-helpers";
import type { PanelVisibilityInput } from "src/lib/information-panel-helpers";

/**
 * Memoized computation of which InformationPanel tabs are currently available.
 * Wraps getAvailableTabs with useMemo to avoid recomputing on every render.
 */
export function useAvailableTabs(input: PanelVisibilityInput): string[] {
  return useMemo(
    () => getAvailableTabs(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      input.informationPanel,
      input.annotationResources,
      input.filteredAnnotationResources,
      input.contentSearchResource,
      input.pluginsWithInfoPanel,
      input.contentStateAnnotation,
      input.annotationCollection,
      input.activeCanvas,
    ],
  );
}
