import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import Collection from "src/components/Viewer/Collection/Collection";
import CopyText from "src/components/Viewer/CopyText";
import IIIFBadge from "src/components/Viewer/Viewer/IIIFBadge";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Popover } from "src/components/UI";
import React from "react";
import Toggle from "./Toggle";
import ViewerDownload from "./Download";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import {
  viewerBadgeButton,
  viewerHeader,
  viewerHeaderOptions,
  viewerManifestLabel,
  viewerPopoverContent,
} from "./Header.css";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { collection, configOptions } = viewerState;

  const { informationPanel, showDownload, showIIIFBadge, showTitle } =
    configOptions;

  /**
   * Determine if header options should be rendered.
   */
  const hasOptions =
    showDownload || showIIIFBadge || informationPanel?.renderToggle;

  const { t } = useCloverTranslation();

  return (
    <header className={`${viewerHeader} clover-viewer-header`}>
      {collection?.items ? (
        <Collection />
      ) : (
        <span
          className={`${viewerManifestLabel} ${!showTitle ? "visually-hidden" : ""}`.trim()}
        >
          {showTitle && <Label label={manifestLabel} className="label" />}
        </span>
      )}
      {hasOptions && (
        <div className={viewerHeaderOptions}>
          {showDownload && <ViewerDownload />}
          {showIIIFBadge && (
            <Popover>
              <Popover.Trigger className={viewerBadgeButton}>
                <IIIFBadge title={t("commonShare")} />
              </Popover.Trigger>
              <Popover.Content className={viewerPopoverContent}>
                {collection?.items && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(collection.id, "_blank");
                    }}
                  >
                    {t("shareCollectionJson")}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(manifestId, "_blank");
                  }}
                >
                  {t("shareManifestJson")}
                </button>{" "}
                {collection?.items && (
                  <CopyText
                    textPrompt={t("shareCollectionCopy")}
                    textToCopy={collection.id}
                  />
                )}
                <CopyText
                  textPrompt={t("shareManifestCopy")}
                  textToCopy={manifestId}
                />
              </Popover.Content>
            </Popover>
          )}
          {informationPanel?.renderToggle && <Toggle />}
        </div>
      )}
    </header>
  );
};

export default ViewerHeader;
