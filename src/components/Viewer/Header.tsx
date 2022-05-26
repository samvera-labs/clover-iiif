import React from "react";
import { Header, IIIFBadgeButton, IIIFBadgeContent } from "./Header.styled";
import { InternationalString } from "@iiif/presentation-3";
import { getLabel } from "hooks/use-iiif";
import { Popover } from "@nulib/design-system";
import IIIFBadge from "@/components/Viewer/IIIFBadge";
import CopyText from "@/components/CopyText";
import { useViewerState } from "@/context/viewer-context";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: any = useViewerState();
  const { configOptions } = viewerState;

  const { showTitle, showIIIFBadge } = configOptions;

  if (!showTitle && !showIIIFBadge) return <></>;

  return (
    <Header className="clover-header">
      {showTitle && (
        <span>{getLabel(manifestLabel as InternationalString, "en")}</span>
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
