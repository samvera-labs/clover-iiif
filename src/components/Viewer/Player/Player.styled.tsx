import { styled } from "src/styles/stitches.config";

export const PlayerWrapper = styled("div", {
  position: "relative",
  backgroundColor: "$primaryAlt",
  display: "flex",
  flexGrow: "0",
  flexShrink: "1",
  height: "100%",
  zIndex: "1",

  video: {
    backgroundColor: "transparent",
    objectFit: "contain",
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: "1",
  },
});
