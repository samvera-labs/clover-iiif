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
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  boxShadow: "-5px 0 5px #00000011",
});
