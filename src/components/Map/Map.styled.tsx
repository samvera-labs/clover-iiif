import { styled } from "src/styles/stitches.config";

const Canvas = styled("div", {
  width: "100%",
  height: "100%",
});

const Wrapper = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: "20rem",
  overflow: "hidden",
  isolation: "isolate",
  zIndex: "0",

  // MapLibre's base stylesheet sets an opinionated `font: 12px/20px Helvetica
  // Neue, Arial, Helvetica, sans-serif` shorthand on `.maplibregl-map`, which
  // cascades font-size/line-height/font-family to every descendant (popups
  // included). `font: inherit` resets the whole shorthand back to the
  // document's own values instead of overriding font-family alone.
  ".maplibregl-map": {
    font: "inherit",
  },

  ".maplibregl-map a": {
    color: "$accent",
  },

  ".maplibregl-ctrl": {
    font: "inherit",
  },

  // Crosshair cursor override (applied via className)
  "&.clover-map-crosshair .maplibregl-canvas-container canvas": {
    cursor: "crosshair !important",
  },

  // Dragging cursor override
  "&.clover-map-dragging .maplibregl-canvas-container canvas": {
    cursor: "grabbing !important",
  },

  ".clover-map-popup-wrapper": {
    marginBottom: "0.618rem",
  },

  ".clover-map-popup-wrapper .maplibregl-popup-content": {
    overflow: "hidden",
    padding: "0",
    borderRadius: "3px",
    border: "1px solid $secondary",
    boxShadow: "2px 2px 5px #0001",
  },

  ".clover-map-popup-wrapper .maplibregl-popup-close-button": {
    display: "none",
  },

  ".clover-map-popup": {
    display: "flex",
    flexDirection: "column",
    minWidth: "15rem",
    maxWidth: "20rem",
    backgroundColor: "$secondary",
    color: "$primary",
    font: "inherit",
    margin: "0",
  },

  ".clover-map-popup-media": {
    width: "100%",
    maxHeight: "10.5rem",
    overflow: "hidden",
    backgroundColor: "$secondary",

    img: {
      display: "block",
      width: "100%",
      height: "100%",
      maxHeight: "10rem",
      objectFit: "cover",
      objectPosition: "50% 50%",
    },
  },

  ".clover-map-popup-body": {
    display: "flex",
    flexDirection: "column",
    gap: "0.382rem",
    padding: "0.618rem 1rem 1rem",
  },

  ".clover-map-popup-context": {
    color: "$primary",
    fontSize: "0.7222rem",
    fontWeight: "500",
    lineHeight: "1rem",
  },

  ".clover-map-popup-title": {
    color: "$primary",
    display: "block",
    fontSize: "1rem",
    fontWeight: "500",
    lineHeight: "1.3",
  },

  ".clover-map-popup-location": {
    color: "$primary",
    fontSize: "0.8333rem",
    lineHeight: "1.25rem",
  },

  ".clover-map-popup-summary": {
    color: "$primary",
    fontSize: "1rem",
    lineHeight: "1.4",
  },
});

export { Canvas, Wrapper };
