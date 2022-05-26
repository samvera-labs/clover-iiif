import { styled } from "@/stitches";

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
});

const Viewport = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

const Wrapper = styled("div", {
  width: "100%",
  height: "61.8vh",
  maxHeight: "100vh",
  background: "black",
  backgroundSize: "contain",
  color: "white",
  position: "relative",
  zIndex: "1",
  overflow: "hidden",
});

export { Navigator, Viewport, Wrapper };
