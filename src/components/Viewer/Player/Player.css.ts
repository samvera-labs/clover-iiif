import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const playerWrapper = style({
  position: "relative",
  backgroundColor: vars.colors.foregroundAlt,
  display: "flex",
  flexGrow: 0,
  flexShrink: 1,
  height: "100%",
  zIndex: 1,
});

export const audioVisualizerCanvas = style({
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: 0,
});

globalStyle(`.${playerWrapper} video`, {
  backgroundColor: "transparent",
  objectFit: "contain",
  width: "100%",
  height: "100%",
  position: "relative",
  zIndex: 1,
});
