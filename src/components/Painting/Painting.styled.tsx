import { styled } from "@/stitches";
import { Item as ButtonStyled } from "@/components/ImageViewer/Button.styled";
import { PlaceholderStyled } from "./Placeholder.styled";

const Toggle = styled(ButtonStyled, {
  position: "absolute",
  width: "2rem",
  top: "1rem",
  right: "1rem",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  transition: "$all",

  variants: {
    isInteractive: {
      true: {
        cursor: "pointer",

        "&:hover": {
          opacity: "1",
        },
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
        filter: "brightness(0.85)",
      },
    },
  },
});

export { PaintingStyled, Toggle };
