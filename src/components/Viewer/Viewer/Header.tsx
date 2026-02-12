import {
  Header,
  HeaderOptions,
  IIIFBadgeButton,
  ManifestLabel,
  PopoverContent,
} from "./Header.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import Collection from "src/components/Viewer/Collection/Collection";
import CopyText from "src/components/Viewer/CopyText";
import IIIFBadge from "src/components/Viewer/Viewer/IIIFBadge";
import { InternationalString, ManifestNormalized } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Popover } from "src/components/UI";
import React from "react";
import Toggle from "./Toggle";
import ViewerDownload from "./Download";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const ViewerHeader: React.FC = () => {
  const viewerState: ViewerContextStore = useViewerState();
  const { collection, configOptions, activeManifest, vault } = viewerState;

  const manifest: ManifestNormalized = vault.get(activeManifest),
    manifestLabel = (manifest.label ?? "") as InternationalString,
    manifestId = manifest.id;

  const { informationPanel, showDownload, showIIIFBadge, showTitle } =
    configOptions;

  /**
   * Determine if header options should be rendered.
   */
  const hasOptions =
    showDownload || showIIIFBadge || informationPanel?.renderToggle;

  const { t } = useCloverTranslation();

  return (
    <Header className="clover-viewer-header">
      {collection?.items ? (
        <Collection />
      ) : (
        <ManifestLabel className={!showTitle ? "visually-hidden" : ""}>
          {showTitle && <Label label={manifestLabel} className="label" />}
        </ManifestLabel>
      )}
      {hasOptions && (
        <HeaderOptions>
          {showDownload && <ViewerDownload />}
          {showIIIFBadge && (
            <Popover>
              <IIIFBadgeButton>
                <IIIFBadge title={t("commonShare")} />
              </IIIFBadgeButton>
              <PopoverContent>
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
              </PopoverContent>
            </Popover>
          )}
          {informationPanel?.renderToggle && <Toggle />}
        </HeaderOptions>
      )}
    </Header>
  );
};

export default ViewerHeader;
