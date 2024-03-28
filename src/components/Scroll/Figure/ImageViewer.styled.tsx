import { styled } from "src/styles/stitches.config";

const StyledImageViewer = styled("div", {
  width: "100%",
  height: "400px",
  background: "#6662",
  backgroundSize: "contain",
  color: "white",
  position: "relative",
  zIndex: "1",
  overflow: "hidden",
});

export { StyledImageViewer };
