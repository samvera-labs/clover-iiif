import { styled } from "src/styles/stitches.config";

const AnimationBar = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.5rem",
  position: "relative",

  "@sm": {
    flexDirection: "column",
    alignItems: "flex-start",
  },
});

const AnimationControlsWrapper = styled("div", {
  display: "flex",
  flexShrink: "0",
  alignItems: "center",
  borderRadius: "2rem",
  position: "absolute",
  right: "0.5rem",
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
  color: "$accent",
  cursor: "pointer",
  transition: "$all",
  flexShrink: "0",
  opacity: "1",

  svg: {
    height: "50%",
    width: "50%",
    padding: "25%",
    opacity: "1",
    fill: "$accent",
    stroke: "$accent",
    boxSizing: "content-box",
    display: "block",
    transition: "$all",
  },

  "&:disabled": {
    backgroundColor: "transparent",
    boxShadow: "none",
    svg: { opacity: "0.25", color: "$accent", stroke: "$accent" },
  },

  "&:not(:disabled):hover": {
    opacity: "1",

    svg: {
      opacity: "1",
      color: "$accent",
      stroke: "$accent",
    },
  },

  "&[data-active=true]": {
    opacity: "1",
    svg: {
      opacity: "1",
      color: "$accent",
      path: { strokeWidth: "56" },
    },
  },
});

const AnimationCounter = styled("span", {
  display: "flex",
  fontSize: "0.7222rem",
  gap: "0.25rem",
  fontWeight: "bold",
  whiteSpace: "nowrap",
  letterSpacing: "0",
  marginRight: "0.5rem",

  em: {
    opacity: "0.25",
    fontStyle: "normal",
  },
});

export {
  AnimationBar,
  AnimationButton,
  AnimationControlsWrapper,
  AnimationCounter,
};
