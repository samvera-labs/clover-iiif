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
  /*
   * Colour is left entirely to the base button this extends. It used to override the
   * surface to `$primary`, which broke once that base inverted: the override kept the dark
   * background while the glyph inherited the base's now-dark `fill`, and the icon vanished
   * into it.
   */
  cursor: "pointer",

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
    hasInformationToggle: {
      true: {
        right: "3.618rem",
        "@xs": { top: "3.618rem", right: "1rem" },
      },
      false: { right: "1rem" },
    },
    panelOpen: {
      true: {},
      false: {},
    },
  },

  compoundVariants: [
    {
      hasInformationToggle: true,
      panelOpen: true,
      css: { right: "1.382rem" },
    },
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
