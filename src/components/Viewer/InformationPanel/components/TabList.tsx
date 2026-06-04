import React from "react";
import { Trigger } from "../InformationPanel.styled";
import { Icon } from "src/components/UI";
import { Label } from "src/components/Primitives";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { InternationalString } from "@iiif/presentation-3";
import type { PluginConfig } from "src/context/viewer-context";

interface TabListProps {
  renderToggle?: boolean;
  renderAbout?: boolean;
  renderContentSearch?: boolean;
  contentSearchResource?: unknown;
  renderAnnotation?: boolean;
  hasAnnotations: boolean;
  annotationTabLabel?: string;
  pluginsWithInfoPanel?: PluginConfig[];
  onClose: () => void;
}

export const TabList: React.FC<TabListProps> = ({
  renderToggle,
  renderAbout,
  renderContentSearch,
  contentSearchResource,
  renderAnnotation,
  hasAnnotations,
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
      {renderAbout && (
        <Trigger value="manifest-about">
          {t("informationPanelTabsAbout")}
        </Trigger>
      )}
      {renderContentSearch && contentSearchResource && (
        <Trigger value="manifest-content-search">
          {t("informationPanelTabsSearch")}
        </Trigger>
      )}
      {renderAnnotation && hasAnnotations && (
        <Trigger value="manifest-annotations">
          {annotationTabLabel || t("informationPanelTabsAnnotations")}
        </Trigger>
      )}
      {pluginsWithInfoPanel?.map((plugin, i) => (
        <Trigger key={i} value={plugin.id}>
          <Label
            label={plugin.informationPanel?.label as InternationalString}
          />
        </Trigger>
      ))}
    </>
  );
};
