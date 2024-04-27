import { styled } from "src/styles/stitches.config";

const Navigator = styled("div", {
  position: "absolute !important",
  zIndex: "1",
  top: "1rem",
  left: "1rem",
  width: "161.8px",
  height: "100px",
  backgroundColor: "#000D",
  boxShadow: "var(--shadow-3)",

  ".displayregion": {
    border: " 2px solid var(--accent-10) !important",
    boxShadow: "var(--shadow-3)",
  },

  "@sm": {
    width: "123px",
    height: "76px",
  },

  "@xs": {
    width: "100px",
    height: "61.8px",
  },
});

const Viewport = styled("div", {
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

const Wrapper = styled("div", {
  objectFit: "cover",
  background: "transparent",
  backgroundSize: "contain",
  color: "white",
  position: "relative",
  zIndex: "0",
  overflow: "hidden",

  variants: {
    hasNavigator: {
      true: {
        [`${Navigator}`]: {
          display: "block",
        },
      },
      false: {
        [`${Navigator}`]: {
          display: "none",
        },
      },
    },
  },
});

export { Navigator, Viewport, Wrapper };
