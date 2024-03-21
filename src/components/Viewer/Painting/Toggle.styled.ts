import { Item as ButtonStyled } from "src/components/Image/Controls/Button.styled";
import { styled } from "src/styles/stitches.config";

const ToggleStyled = styled(ButtonStyled, {
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
  borderRadius: "50%",
  backgroundColor: "$accent",
  cursor: "pointer",

  "&:hover, &:focus": {
    backgroundColor: "$accent !important",
  },

  variants: {
    isInteractive: {
      true: {
        "&:hover": {
          opacity: "1",
        },
      },
      false: {},
    },
    isMedia: {
      true: {
        cursor: "pointer !important",
      },
    },
  },

  compoundVariants: [
    {
      isInteractive: false,
      isMedia: true,
      css: {
        top: "50%",
        right: "50%",
        width: "4rem",
        height: "4rem",
        transform: "translate(50%,-50%)",
      },
    },
  ],
});

export { ToggleStyled };
