import { styled } from "src/styles/stitches.config";

const AnimationControlsWrapper = styled("div", {
  position: "absolute",
  bottom: "1rem",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  backgroundColor: "$accentAlt",
  borderRadius: "2rem",
  boxShadow: "5px 5px 5px #0003",
  color: "$secondary",
  padding: "0",
  zIndex: "$1",
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
  backgroundColor: "$accent",
  color: "$secondary",
  cursor: "pointer",
  transition: "$all",
  flexShrink: "0",

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$secondary",
    stroke: "$secondary",
    opacity: "1",
    filter: "drop-shadow(5px 5px 5px #000D)",
    boxSizing: "border-box",
    transition: "$all",
  },

  "&:disabled": {
    backgroundColor: "transparent",
    boxShadow: "none",
    svg: { opacity: "0.25" },
  },
});

const AnimationCounter = styled("span", {
  display: "flex",
  margin: "0 0.25rem",
  fontSize: "0.7222rem",
  fontWeight: "bold",
  gap: "0.25rem",
  whiteSpace: "nowrap",

  em: {
    opacity: "0.25",
    fontStyle: "normal",
  },
});

export { AnimationButton, AnimationControlsWrapper, AnimationCounter };
