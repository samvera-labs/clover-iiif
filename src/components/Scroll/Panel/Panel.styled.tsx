import { styled } from "src/styles/stitches.config";

const StyledPanel = styled("div", {
  display: "flex",
  position: "relative",
  zIndex: "1",
  maxWidth: "100%",
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
