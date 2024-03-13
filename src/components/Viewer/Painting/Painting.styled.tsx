import { PlaceholderStyled } from "./Placeholder.styled";
import { ToggleStyled } from "src/components/Viewer/Painting/Toggle.styled";
import { styled } from "src/styles/stitches.config";

const PaintingStyled = styled("div", {
  position: "relative",
  zIndex: "0",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  gap: "1rem",

  "&:hover": {
    [`${ToggleStyled}`]: {
      backgroundColor: "$accent",
    },

    [`${PlaceholderStyled}`]: {
      backgroundColor: "#6662",

      img: {
        filter: "brightness(0.85)",
      },
    },
  },
});

const PaintingCanvas = styled("div", {});

export { PaintingCanvas, PaintingStyled, ToggleStyled };
