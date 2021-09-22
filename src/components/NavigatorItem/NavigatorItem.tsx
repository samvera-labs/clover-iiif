import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";

interface Props {
  label: string;
  startTime: string;
  t: number;
}

const NavigatorItem: React.FC<Props> = ({ label, startTime, t }) => {
  return (
    <NavigatorItemWrapper>
      cue.label
      <strong>cue.startTime</strong>
    </NavigatorItemWrapper>
  );
};

const NavigatorItemWrapper = styled("a", {
  display: "flex",
  flexGrow: "1",
  justifyContent: "space-between",
  padding: "0.5rem  1.618rem ",
  cursor: "pointer",

  "&:last-child": {
    margin: "0 0 1.618rem",
  },

  strong: {
    fontSize: "0.8333rem",
  },
});

export default NavigatorItem;
