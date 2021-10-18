import React from "react";
import { styled } from "@stitches/react";
import { InternationalString } from "@hyperion-framework/types";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import { getLabel } from "hooks/use-hyperion-framework";
import { theme } from "theme";

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
  position: "relative",
  padding: "0.6rem 1rem 0.5rem",
  background: "none",
  backgroundColor: "transparent",
  color: theme.color.primaryMuted,
  border: "none",
  fontFamily: "inherit",
  fontSize: "1rem",
  marginRight: "1rem",
  lineHeight: "1rem",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontWeight: 700,
  transition: theme.transition.all,

  "&::after": {
    width: "0",
    height: "4px",
    content: "",
    backgroundColor: theme.color.primaryMuted,
    position: "absolute",
    bottom: "-4px",
    left: "0",
    transition: theme.transition.all,
  },

  "&:hover": {
    color: theme.color.primary,
  },

  "&[data-active=true]": {
    color: theme.color.accent,

    "&::after": {
      width: "100%",
      backgroundColor: theme.color.accent,
    },
  },
});

export default NavigatorTab;
