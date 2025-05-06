import { styled } from "src/styles/stitches.config";

const Navigator = styled("div", {
  position: "absolute !important",
  zIndex: "1",
  top: "1rem",
  left: "1rem",
  width: "161.8px",
  height: "100px",
  backgroundColor: "#000D",
  boxShadow: "5px 5px 5px #0002",
  borderRadius: "3px",

  ".displayregion": {
    border: " 3px solid $accent !important",
    boxShadow: "0 0 3px #0006",
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
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",

  ".clover-iiif-image-openseadragon-annotation": {
    position: "relative",
    backgroundColor: "transparent",
    border: "2px solid #0003",
    boxSizing: "content-box",
    borderRadius: "3px",
    boxShadow: "0 0 38vw 38vw transparent",
    transition: "box-shadow 100ms ease-in-out",
    zIndex: "0",

    label: {
      opacity: 0,
      position: "absolute",
      lineHeight: "1.47rem",
      pointerEvents: "none",
      textAlign: "center",
      minWidth: "300px",
      maxWidth: "20vw",
      padding: "0.5rem",
      borderRadius: "3px",
      top: "calc(100% + 0.5rem)",
      left: "50%",
      transform: "translate(-50%, 0)",
      backgroundColor: "$primary",
      color: "$secondary",
      transition: "opacity 100ms ease-in-out",
    },

    "&[data-active=true]": {
      border: "2px solid $accent !important",
      boxShadow: "0 0 38vw 38vw #0003",
      zIndex: "99999999",

      label: {
        opacity: 1,
      },
    },
  },
});

const Wrapper = styled("div", {
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
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
