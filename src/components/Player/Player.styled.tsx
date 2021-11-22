import { styled } from "stitches";

export const PlayerWrapper = styled("div", {
  display: "flex",
  flexGrow: "0",
  flexShrink: "1",
  maxHeight: "450px",

  video: {
    display: "flex",
    position: "relative",
    objectFit: "contain",
    width: "100%",
    height: "100%",
    backgroundColor: "$primaryAlt",
  },
});
