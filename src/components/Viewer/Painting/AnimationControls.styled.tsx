import { styled } from "src/styles/stitches.config";

const AnimationControlsWrapper = styled("div", {
  display: "flex",
  flexShrink: "0",
  alignItems: "center",
  gap: "0.25rem",
  borderRadius: "2rem",
  color: "$secondary",
  position: "absolute",
  zIndex: 100,
  bottom: "1rem",
  backgroundColor: "#111C",
  padding: "0 0.5rem 0 0.25rem",
  left: "1rem",
});

const AnimationButton = styled("button", {
  display: "flex",
  background: "none",
  border: "none",
  width: "2rem",
  height: "2rem",
  padding: "0",
  margin: "0",
  borderRadius: "2rem",
  color: "$secondary",
  cursor: "pointer",
  transition: "$all",
  flexShrink: "0",
  opacity: "0.5",

  svg: {
    height: "52%",
    width: "52%",
    padding: "24%",
    fill: "$secondary",
    stroke: "$secondary",
    opacity: "1",
    boxSizing: "content-box",
    display: "block",
    transition: "$all",
  },

  "&:disabled": {
    backgroundColor: "transparent",
    boxShadow: "none",
    svg: { opacity: "0.25" },
  },

  "&:not(:disabled):hover": {
    opacity: "1",

    svg: {
      opacity: "1",
    },
  },

  "&[data-active=true]": {
    opacity: "1",
    svg: {
      opacity: "1",
      path: { strokeWidth: "56" },
    },
  },
});

const AnimationCounter = styled("span", {
  display: "flex",
  margin: "0 0.25rem",
  fontSize: "0.7222rem",
  fontWeight: "bold",
  gap: "0.25rem",
  whiteSpace: "nowrap",
  fontFamily: "monospace",

  em: {
    opacity: "0.25",
    fontStyle: "normal",
  },
});

export { AnimationButton, AnimationControlsWrapper, AnimationCounter };
