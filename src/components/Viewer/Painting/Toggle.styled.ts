import { Item as ButtonStyled } from "src/components/Image/Controls/Button.styled";
import { styled } from "src/styles/stitches.config";

const ToggleStyled = styled(ButtonStyled, {
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
