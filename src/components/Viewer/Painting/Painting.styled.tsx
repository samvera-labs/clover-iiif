import { PlaceholderStyled } from "./Placeholder.styled";
import { ToggleStyled } from "src/components/Viewer/Painting/Toggle.styled";
import { styled } from "src/styles/stitches.config";

const PaintingStyled = styled("div", {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "1",
  gap: "1rem",
  zIndex: "0",
  overflow: "hidden",

  "&:hover": {
    [`${PlaceholderStyled}`]: {
      backgroundColor: "#6662",
    },
  },
});

const PaintingCanvas = styled("div", {
  width: "100%",
  height: "100%",
});

export { PaintingCanvas, PaintingStyled, ToggleStyled };
