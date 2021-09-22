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
  cursor: "pointer",
});

export default NavigatorItem;
