import { styled } from "src/styles/stitches.config";
import { ToggleStyled } from "src/components/Viewer/Painting/Toggle.styled";
import { PlaceholderStyled } from "./Placeholder.styled";

const PaintingStyled = styled("div", {
  position: "relative",
  zIndex: "0",

  "&:hover": {
    [`${ToggleStyled}`]: {
      backgroundColor: "$accent",
    },

    [`${PlaceholderStyled}`]: {
      backgroundColor: "$secondaryAlt",

      img: {
        filter: "brightness(0.85)",
      },
    },
  },
});

export { PaintingStyled, ToggleStyled };
