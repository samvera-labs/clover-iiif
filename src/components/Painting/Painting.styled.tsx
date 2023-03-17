import { styled } from "@/stitches";
import { ToggleStyled } from "@/components/Painting/Toggle.styled";
import { PlaceholderStyled } from "./Placeholder.styled";

const PaintingStyled = styled("div", {
  position: "relative",

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
