import * as Switch from "@radix-ui/react-switch";

import {
  Header,
  IIIFBadgeButton,
  IIIFBadgeContent,
  ManifestLabel,
} from "./Header.styled";

import Collection from "src/components/Viewer/Collection/Collection";
import CopyText from "src/components/Viewer/CopyText";
import IIIFBadge from "src/components/Viewer/Viewer/IIIFBadge";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Popover } from "src/components/internal";
import React from "react";
import Toggle from "./Toggle";
import { useViewerState } from "src/context/viewer-context";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: any = useViewerState();
  const { collection, configOptions } = viewerState;

  const { showTitle, showIIIFBadge, showInformationToggle } = configOptions;

  if (
    !collection?.items &&
    !showTitle &&
    !showIIIFBadge &&
    !showInformationToggle
  )
    return <></>;

  return (
    <Header className="clover-header">
      {collection?.items ? (
        <Collection />
      ) : (
        <ManifestLabel>
          <Label label={manifestLabel} />
        </ManifestLabel>
      )}
      {showIIIFBadge && (
        <Popover>
          <IIIFBadgeButton>
            <IIIFBadge />
          </IIIFBadgeButton>
          <IIIFBadgeContent>
            {collection?.items && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open(collection.id, "_blank");
                }}
              >
                View Collection
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                window.open(manifestId, "_blank");
              }}
            >
              View Manifest
            </button>{" "}
            {collection?.items && (
              <CopyText
                textPrompt="Copy Collection URL"
                textToCopy={collection.id}
              />
            )}
            <CopyText textPrompt="Copy Manifest URL" textToCopy={manifestId} />
          </IIIFBadgeContent>
        </Popover>
      )}
      {showInformationToggle && <Toggle />}
    </Header>
  );
};

export default ViewerHeader;
