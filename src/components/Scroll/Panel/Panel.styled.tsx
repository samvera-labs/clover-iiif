import { styled } from "src/styles/stitches.config";

const StyledPanel = styled("div", {
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  maxWidth: "100%",
  marginTop: "1rem",
  transition: "$all",

  variants: {
    isPanelExpanded: {
      true: {
        zIndex: 1,
        opacity: 1,
        transform: "translateX(0)",
      },
      false: {
        zIndex: -1,
        opacity: 0,
        transform: "translateX(-2.618rem)",
        transitionDelay: "0",
        transition: "none",
      },
    },
  },
});

export { StyledPanel };
