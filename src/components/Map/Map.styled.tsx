import { styled } from "src/styles/stitches.config";

const Wrapper = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: "20rem",
  overflow: "hidden",
  isolation: "isolate",
  zIndex: "0",

  ".leaflet-container": {
    fontFamily: "inherit",
  },

  ".leaflet-container a": {
    color: "$accentAlt",
  },

  ".leaflet-control-container": {
    fontFamily: "inherit",
  },

  // Crosshair cursor override (applied via className)
  "&.clover-map-crosshair .leaflet-pane, &.clover-map-crosshair .leaflet-pane *":
    {
      cursor: "crosshair !important",
    },

  // Dragging cursor override
  "&.clover-map-dragging .leaflet-pane, &.clover-map-dragging .leaflet-pane *":
    {
      cursor: "grabbing !important",
    },

  ".leaflet-interactive": {
    transition: "stroke-width 120ms ease, fill-opacity 120ms ease",
  },

  ".leaflet-interactive:hover": {
    strokeWidth: "3",
    fillOpacity: "0.95",
  },

  ".clover-map-leaflet-popup": {
    marginBottom: "0.75rem",
  },

  ".clover-map-leaflet-popup .leaflet-popup-content-wrapper": {
    overflow: "hidden",
    padding: "0",
    borderRadius: "0.25rem",
    border: "1px solid #0002",
    boxShadow: "0 14px 36px #0004",
  },

  ".clover-map-leaflet-popup .leaflet-popup-content": {
    width: "auto !important",
    margin: "0",
    color: "$primary",
    fontFamily: "inherit",
  },

  ".clover-map-leaflet-popup .leaflet-popup-tip": {
    boxShadow: "0 6px 18px #0003",
  },

  ".clover-map-leaflet-popup .leaflet-popup-close-button": {
    display: "none",
  },

  ".clover-map-popup": {
    display: "flex",
    flexDirection: "column",
    minWidth: "15rem",
    maxWidth: "20rem",
    backgroundColor: "$secondary",
  },

  ".clover-map-popup-media": {
    width: "100%",
    maxHeight: "10.5rem",
    overflow: "hidden",
    backgroundColor: "#6663",

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
    padding: "0.875rem 1rem 1rem",
  },

  ".clover-map-popup-context": {
    color: "$secondaryAlt",
    fontSize: "0.72rem",
    fontWeight: "500",
    letterSpacing: "0.04em",
    lineHeight: "1rem",
    textTransform: "uppercase",
  },

  ".clover-map-popup-title": {
    color: "$primary",
    display: "block",
    fontSize: "1.0625rem",
    fontWeight: "500",
    lineHeight: "1.3",
    textDecoration: "none",
  },

  "a.clover-map-popup-title:hover, a.clover-map-popup-title:focus-visible": {
    color: "$accentAlt",
    textDecoration: "underline",
    textUnderlineOffset: "0.18em",
  },

  ".clover-map-popup-location": {
    color: "$accentAlt",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },

  ".clover-map-popup-summary": {
    color: "$secondaryAlt",
    fontSize: "0.875rem",
    lineHeight: "1.4",
  },
});

export { Wrapper };
