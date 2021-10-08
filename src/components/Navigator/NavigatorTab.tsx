import React from "react";
import { styled } from "@stitches/react";
import { InternationalString } from "@hyperion-framework/types";
import { LabeledResource } from "hooks/use-hyperion-framework/getContentResourcesByCriteria";
import { getLabel } from "hooks/use-hyperion-framework";

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

const NavigatorTabButton = styled("button", {
  display: "flex",
  padding: "calc(0.618rem - 2px) calc(1rem - 2px)",
  background: "none",
  backgroundColor: "transparent",
  border: "1px solid #d8d8d8",
  color: "rgb(52, 47, 46)",
  fontFamily: "inherit",
  fontSize: "1rem",
  textTransform: "uppercase",
  marginRight: "1rem",
  whiteSpace: "nowrap",
  cursor: "pointer",

  "&[data-active=true]": {
    backgroundColor: "#d8d8d8",
    fontWeight: 700,
  },
});

export default NavigatorTab;
