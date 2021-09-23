import React, { useEffect, useState } from "react";
import { styled } from "@stitches/react";

interface Props {
  label: string;
  startTime: string;
  t: number;
}

const NavigatorItem: React.FC<Props> = ({ text, startTime, t }) => {
  return (
    <NavigatorItemWrapper>
      {text}
      <strong>{startTime}</strong>
    </NavigatorItemWrapper>
  );
};

const NavigatorItemWrapper = styled("a", {
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

export default NavigatorItem;
