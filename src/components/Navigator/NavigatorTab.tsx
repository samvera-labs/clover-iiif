import React from "react";
import { InternationalString } from "@hyperion-framework/types";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import { getLabel } from "hooks/use-hyperion-framework";
import { NavigatorTabButton } from "./NavigatorTab.styled";

interface NavigatorTabProps {
  active: boolean;
  resource: LabeledResource;
  handleChange: (arg0: string) => void;
}

const NavigatorTab: React.FC<NavigatorTabProps> = ({
  active,
  resource,
  handleChange,
}) => {
  /*
   * label is optional on a Content Resource per
   * https://iiif.io/api/presentation/3.0/#a-summary-of-property-requirements
   * yet does not seem to be included in any content
   * resource like type in hyperion-framework
   */
  return (
    <NavigatorTabButton
      onClick={() => handleChange(resource.id as string)}
      data-active={active}
      data-testid="navigator-tab"
    >
      {getLabel(resource.label as InternationalString, "en")}
    </NavigatorTabButton>
  );
};

export default NavigatorTab;
