import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";

interface Props {
  currentTime: number;
  tracks: object;
}

export const Navigator: React.FC<Props> = ({ currentTime }) => {
  return <NavigatorWrapper>{currentTime}</NavigatorWrapper>;
};

const NavigatorWrapper = styled("div", {
  width: "38.2%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  backgroundColor: "LightBlue",
});
