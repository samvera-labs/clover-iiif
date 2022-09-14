import React from "react";
import {
  Header,
  IIIFBadgeButton,
  IIIFBadgeContent,
  ManifestLabel,
} from "./Header.styled";
import { InternationalString } from "@iiif/presentation-3";
import { getLabel } from "hooks/use-iiif";
import { Popover } from "@nulib/design-system";
import IIIFBadge from "@/components/Viewer/IIIFBadge";
import CopyText from "@/components/CopyText";
import { useViewerState } from "@/context/viewer-context";
import Collection from "@/components/Collection/Collection";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: any = useViewerState();
  const { collection, configOptions } = viewerState;

  const { showTitle, showIIIFBadge } = configOptions;

  if (!showTitle && !showIIIFBadge) return <></>;

  return (
    <Header className="clover-header">
      {collection?.items ? (
        <Collection />
      ) : (
        <ManifestLabel>
          {getLabel(manifestLabel as InternationalString, "en")}
        </ManifestLabel>
      )}
      {showIIIFBadge && (
        <Popover>
          <IIIFBadgeButton>
            <IIIFBadge />
          </IIIFBadgeButton>
          <IIIFBadgeContent>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.open(manifestId, "_blank");
              }}
            >
              View Manifest
            </button>
            <CopyText textPrompt="Copy Manifest URL" textToCopy={manifestId} />
          </IIIFBadgeContent>
        </Popover>
      )}
    </Header>
  );
};

export default ViewerHeader;
