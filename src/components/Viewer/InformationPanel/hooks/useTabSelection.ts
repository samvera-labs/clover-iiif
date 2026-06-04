import { useEffect, useRef } from "react";
import { getDefaultTab } from "src/lib/information-panel-helpers";

/**
 * Manages InformationPanel tab selection:
 * - Selects the default tab (config override or first available)
 * - Preserves the current selection if still available
 * - Applies an async config default when it becomes available after a fallback
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
  const lastAutomaticSelectionRef = useRef<string | undefined>(undefined);
  const appliedConfigDefaultRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const configuredDefaultTab =
      configDefaultTab && availableTabs.includes(configDefaultTab)
        ? configDefaultTab
        : undefined;
    const currentTabIsAvailable = Boolean(
      informationPanelResource &&
        availableTabs.includes(informationPanelResource),
    );
    const currentSelectionWasAutomatic =
      !informationPanelResource ||
      informationPanelResource === lastAutomaticSelectionRef.current;

    if (
      configuredDefaultTab &&
      appliedConfigDefaultRef.current !== configuredDefaultTab &&
      currentSelectionWasAutomatic
    ) {
      appliedConfigDefaultRef.current = configuredDefaultTab;
      lastAutomaticSelectionRef.current = configuredDefaultTab;
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: configuredDefaultTab,
      });
      return;
    }

    // Preserve the current tab selection if it's still available
    if (currentTabIsAvailable) {
      return;
    }

    // Current tab is no longer available — select the best alternative
    const defaultTab = getDefaultTab(availableTabs, configDefaultTab);
    if (defaultTab) {
      if (defaultTab === configDefaultTab) {
        appliedConfigDefaultRef.current = defaultTab;
      }
      lastAutomaticSelectionRef.current = defaultTab;
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: defaultTab,
      });
    }
  }, [availableTabs, informationPanelResource, configDefaultTab, dispatch]);
}
