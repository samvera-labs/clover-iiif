import React from "react";
import { Header, IIIFBadgeButton, IIIFBadgeContent } from "./Header.styled";
import { InternationalString } from "@hyperion-framework/types";
import { getLabel } from "hooks/use-hyperion-framework";
import { Popover } from "@nulib/design-system";
import IIIFBadge from "./IIIFBadge";
import CopyText from "components/CopyText";

interface Props {
  manifestId: string;
  manifestLabel: InternationalString;
  options: any;
}

const ViewerHeader: React.FC<Props> = ({
  manifestId,
  manifestLabel,
  options,
}) => {
  return (
    <Header>
      {options.showTitle && (
        <span>{getLabel(manifestLabel as InternationalString, "en")}</span>
      )}
      {options.showIIIFBadge && (
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
