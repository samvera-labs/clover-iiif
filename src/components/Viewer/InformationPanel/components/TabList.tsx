import React from "react";
import { Trigger } from "../InformationPanel.styled";
import { Icon } from "src/components/UI";
import { Label } from "src/components/Primitives";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { InternationalString } from "@iiif/presentation-3";
import type { PluginConfig } from "src/context/viewer-context";
import { INFORMATION_PANEL_TABS } from "src/lib/information-panel-helpers";

interface TabListProps {
  renderToggle?: boolean;
  availableTabs: string[];
  annotationTabLabel?: string;
  pluginsWithInfoPanel?: PluginConfig[];
  onClose: () => void;
}

export const TabList: React.FC<TabListProps> = ({
  renderToggle,
  availableTabs,
  annotationTabLabel,
  pluginsWithInfoPanel,
  onClose,
}) => {
  const { t } = useCloverTranslation();

  return (
    <>
      {renderToggle && (
        <Trigger
          value="manifest-back"
          data-value="manifest-back"
          onClick={onClose}
          as={"button"}
          aria-label={t("informationPanelTabsClose")}
        >
          <Icon fill="currentColor" aria-hidden="true">
            <Icon.PanelExpand />
          </Icon>
        </Trigger>
      )}
      {availableTabs.includes(INFORMATION_PANEL_TABS.about) && (
        <Trigger value={INFORMATION_PANEL_TABS.about}>
          {t("informationPanelTabsAbout")}
        </Trigger>
      )}
      {availableTabs.includes(INFORMATION_PANEL_TABS.contentSearch) && (
        <Trigger value={INFORMATION_PANEL_TABS.contentSearch}>
          {t("informationPanelTabsSearch")}
        </Trigger>
      )}
      {availableTabs.includes(INFORMATION_PANEL_TABS.annotations) && (
        <Trigger value={INFORMATION_PANEL_TABS.annotations}>
          {annotationTabLabel || t("informationPanelTabsAnnotations")}
        </Trigger>
      )}
      {pluginsWithInfoPanel?.map((plugin) => (
        <Trigger key={plugin.id} value={plugin.id}>
          <Label
            label={plugin.informationPanel?.label as InternationalString}
          />
        </Trigger>
      ))}
    </>
  );
};
