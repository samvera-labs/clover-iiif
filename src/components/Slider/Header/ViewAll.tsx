import React from "react";
import { styled } from "src/styles/stitches.config";

const ViewAllStyled = styled("span", {
  display: "flex",
  background: "none",
  height: "2rem !important",
  padding: "0 $3",
  margin: "0 0 0 $3",
  borderRadius: "2rem",
  backgroundColor: "$accent",
  color: "$secondary",
  cursor: "pointer",
  boxSizing: "content-box !important",
  transition: "$all",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "0.8333rem",
  lineBreak: "none",
  whiteSpace: "nowrap",

  [`&:hover`]: {
    backgroundColor: "$accentAlt",
    boxShadow: "3px 3px 11px #0003",

    [`&:disabled`]: {
      boxShadow: "unset",
    },
  },
});

const ViewAll = () => {
  return <ViewAllStyled>View All</ViewAllStyled>;
};

export default ViewAll;
