import React from "react";
import * as Switch from "@radix-ui/react-switch";

import {
  Header,
  IIIFBadgeButton,
  IIIFBadgeContent,
  ManifestLabel,
} from "./Header.styled";
import { InternationalString } from "@iiif/presentation-3";
import { Popover } from "@nulib/design-system";
import IIIFBadge from "@/components/Viewer/IIIFBadge";
import CopyText from "@/components/CopyText";
import { useViewerState } from "@/context/viewer-context";
import Collection from "@/components/Collection/Collection";
import { Label } from "@samvera/nectar-iiif";
import Toggle from "./Toggle";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
}

const ViewerHeader: React.FC<Props> = ({ manifestId, manifestLabel }) => {
  const viewerState: any = useViewerState();
  const { collection, configOptions } = viewerState;

  const { showTitle, showIIIFBadge, showInformationToggle } = configOptions;

  if (!showTitle && !showIIIFBadge) return <></>;

  return (
    <Header className="clover-header">
      {collection?.items ? (
        <Collection />
      ) : (
        <ManifestLabel>
          <Label label={manifestLabel} />
        </ManifestLabel>
      )}
      {showInformationToggle && <Toggle />}
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
