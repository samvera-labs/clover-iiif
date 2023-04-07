import { styled } from "@/stitches";

export const PlayerWrapper = styled("div", {
  position: "relative",
  backgroundColor: "$primaryAlt",
  display: "flex",
  flexGrow: "0",
  flexShrink: "1",
  maxHeight: "500px",
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
