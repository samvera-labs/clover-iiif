import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const sliderFigure = style({
  display: "flex",
  flexDirection: "column",
  margin: `0 0 ${vars.space[2]}`,
  flexGrow: 0,
  flexShrink: 0,
  borderRadius: vars.radii.sm,
  transition: vars.transitions.all,
});

export const sliderFigureFocused = style({});

globalStyle(`.${sliderFigureFocused} figcaption`, {
  color: vars.colors.accent,
});

globalStyle(`.${sliderFigureFocused} video`, {
  opacity: 1,
});

export const sliderPlaceholder = style({
  display: "flex",
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: vars.radii.sm,
  transition: vars.transitions.all,
});

export const sliderCaption = style({
  display: "flex",
  flexDirection: "column",
  paddingTop: vars.space[2],
  transition: vars.transitions.all,
});

export const sliderTitle = style({
  fontSize: vars.fontSizes[4],
  fontWeight: 600,
});

export const sliderDescription = style({
  fontSize: vars.fontSizes[3],
  marginTop: vars.space[1],
  color: vars.colors.foreground,
});

globalStyle(`.${sliderFigure} img`, {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  objectFit: "cover",
  zIndex: 0,
  width: "100%",
  height: "100%",
  color: "transparent",
});

globalStyle(`.${sliderFigure} video`, {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  objectFit: "cover",
  zIndex: 1,
  width: "100%",
  height: "100%",
  color: "transparent",
  opacity: 0,
  transition: vars.transitions.all,
  borderRadius: vars.radii.sm,
});
