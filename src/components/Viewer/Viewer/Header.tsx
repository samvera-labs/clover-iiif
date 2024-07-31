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
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Popover } from "src/components/UI";
import React from "react";
import Toggle from "./Toggle";
import ViewerDownload from "./Download";
import { media } from "src/styles/stitches.config";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

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
  const isSmallViewport = useMediaQuery(media.sm);

  const { t } = useTranslation();

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
          {informationPanel?.renderToggle && !isSmallViewport && <Toggle />}
        </HeaderOptions>
      )}
    </Header>
  );
};

export default ViewerHeader;
