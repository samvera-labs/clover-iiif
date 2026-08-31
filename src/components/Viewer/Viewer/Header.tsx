import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import Collection from "src/components/Viewer/Collection/Collection";
import CopyText from "src/components/Viewer/CopyText";
import IIIFBadge from "src/components/Viewer/Viewer/IIIFBadge";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Popover } from "src/components/UI";
import React from "react";
import ViewerDownload from "./Download";
import useViewerDownload from "src/hooks/useViewerDownload";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { collection, configOptions } = viewerState;

  const { showDownload, showIIIFBadge, showTitle } = configOptions;

  /*
   * Whether the resource actually offers a download, as distinct from whether the consumer
   * asked for the button. A Manifest or Canvas with no `rendering` has nothing to offer, and
   * `ViewerDownload` correctly renders nothing in that case — but this bar was built on
   * `showDownload` alone, so it still reserved its padding and grew to claim the row. The
   * result was an invisible box in the header.
   */
  const { hasDownload } = useViewerDownload();

  /**
   * Determine if header options should be rendered.
   */
  const hasOptions = (showDownload && hasDownload) || showIIIFBadge;

  const { t } = useCloverTranslation();

  return (
    <header className="clover-viewer-header">
      {collection?.items ? (
        <Collection />
      ) : (
        <span
          className={`clover-viewer-manifest-label${
            !showTitle ? " visually-hidden" : ""
          }`}
        >
          {showTitle && <Label label={manifestLabel} className="label" />}
        </span>
      )}
      {hasOptions && (
        <div className="clover-viewer-header-options">
          {showDownload && hasDownload && <ViewerDownload />}
          {showIIIFBadge && (
            <Popover>
              <Popover.Trigger className="clover-viewer-iiif-badge">
                <IIIFBadge title={t("commonShare")} />
              </Popover.Trigger>
              <Popover.Content className="clover-viewer-popover-content">
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
        </div>
      )}
    </header>
  );
};

export default ViewerHeader;
