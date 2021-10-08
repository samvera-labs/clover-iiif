import React from "react";
import { styled } from "@stitches/react";
import { cleanTime } from "services/utils";

interface Props {
  label: string;
  startTime: string;
  t: number;
}

const NavigatorCue: React.FC<Props> = ({ label, startTime }) => {
  return (
    <NavigatorCueAnchor data-testid="navigator-cue">
      {label}
      <strong>{cleanTime(startTime)}</strong>
    </NavigatorCueAnchor>
  );
};

const NavigatorCueAnchor = styled("a", {
  display: "flex",
  flexGrow: "1",
  justifyContent: "space-between",
  padding: "0.5rem  1.618rem ",
  cursor: "pointer",

  "&:hover": {
    backgroundColor: "#D8D6D6",
  },

  "&:last-child": {
    margin: "0 0 1.618rem",
  },
});

export default NavigatorCue;
