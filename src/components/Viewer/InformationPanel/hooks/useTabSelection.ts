import { useEffect, useRef } from "react";
import { getDefaultTab } from "src/lib/information-panel-helpers";

/**
 * Manages InformationPanel tab selection:
 * - On first mount, selects the default tab (config override or first available)
 * - On subsequent renders, preserves the current selection if still available
 * - Falls back to a new default when the current tab becomes unavailable
 *
 * Does nothing when no tabs are available (avoids dispatching invalid state).
 */
export function useTabSelection({
  availableTabs,
  informationPanelResource,
  configDefaultTab,
  dispatch,
}: {
  availableTabs: string[];
  informationPanelResource: string | undefined;
  configDefaultTab?: string;
  dispatch: (action: { type: string; informationPanelResource: string }) => void;
}): void {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const defaultTab = getDefaultTab(availableTabs, configDefaultTab);
      if (defaultTab) {
        dispatch({
          type: "updateInformationPanelResource",
          informationPanelResource: defaultTab,
        });
      }
      return;
    }

    // Preserve the current tab selection if it's still available
    if (informationPanelResource && availableTabs.includes(informationPanelResource)) {
      return;
    }

    // Current tab is no longer available — select the best alternative
    const defaultTab = getDefaultTab(availableTabs, configDefaultTab);
    if (defaultTab) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: defaultTab,
      });
    }
  }, [availableTabs, informationPanelResource, configDefaultTab, dispatch]);
}
