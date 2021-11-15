import { styled } from "@stitches/react";

const Navigator = styled("div", {
  position: "absolute !important",
  zIndex: "1",
  top: "1rem",
  left: "1rem",
  width: "161.8px",
  height: "100px",
  backgroundColor: "#000D",
  boxShadow: "5px 5px 5px #0002",

  "#openseadragon-navigator-displayregion": {
    border: " 3px solid $accent !important",
    boxShadow: "0 0 3px #0006",
  },
});

const Viewport = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

const Wrapper = styled("div", {
  width: "100%",
  height: "400px",
  background: "black",
  backgroundSize: "contain",
  color: "white",
  position: "relative",
});

export { Navigator, Viewport, Wrapper };
