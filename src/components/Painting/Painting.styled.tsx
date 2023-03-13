import { styled } from "@/stitches";
import { Item as ButtonStyled } from "@/components/ImageViewer/Button.styled";
import { PlaceholderStyled } from "./Placeholder.styled";

const Toggle = styled(ButtonStyled, {
  position: "absolute",
  width: "auto",
  top: "1rem",
  left: "1rem",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "0 1rem",
  transition: "$all",

  variants: {
    isInteractive: {
      true: {
        cursor: "pointer",
      },
      false: {
        cursor: "zoom-in",
      },
    },
  },
});

const PaintingStyled = styled("div", {
  position: "relative",

  "&:hover": {
    [`${Toggle}`]: {
      backgroundColor: "$accent",
    },

    [`${PlaceholderStyled}`]: {
      backgroundColor: "$secondaryAlt",

      img: {
        filter: "brightness(0.8)",
      },
    },
  },
});

export { PaintingStyled, Toggle };
