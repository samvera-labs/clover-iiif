import { styled } from "stitches";

export const PlayerWrapper = styled("div", {
  position: "relative",
  backgroundColor: "$primaryAlt",
  display: "flex",
  flexGrow: "0",
  flexShrink: "1",
  maxHeight: "450px",
  zIndex: "1",

  video: {
    backgroundColor: "transparent",
    display: "flex",
    position: "relative",
    objectFit: "contain",
    width: "100%",
    height: "100%",
    zIndex: "1",
  },
});
