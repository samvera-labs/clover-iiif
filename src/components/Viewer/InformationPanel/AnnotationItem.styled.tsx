import { styled } from "src/styles/stitches.config";

export const Group = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const Item = styled("div", {
  position: "relative",
  cursor: "pointer",
  padding: "0.5rem 1.618rem",
  lineHeight: "1.25em",

  "&:hover": {
    backgroundColor: "$secondaryMuted",
  },
});
