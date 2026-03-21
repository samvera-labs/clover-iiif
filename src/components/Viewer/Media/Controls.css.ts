import { style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const controlsWrapper = style({
  display: "flex",
  position: "relative",
  zIndex: 1,
  width: "100%",
  padding: 0,
  transition: vars.transitions.all,
  selectors: {
    '&[data-filter-active="true"]': {
      paddingTop: "2.618rem",
    },
  },
});

export const controlsForm = style({
  position: "absolute",
  right: vars.space[4],
  top: vars.space[4],
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 1,
});

export const controlsInput = style({
  flexGrow: 1,
  border: "none",
  backgroundColor: vars.colors.backgroundMuted,
  color: vars.colors.foreground,
  marginRight: vars.space[4],
  height: vars.sizes[6],
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radii.pill,
  fontFamily: "inherit",
  fontSize: vars.fontSizes[4],
  lineHeight: vars.lineHeights[4],
  boxShadow: "inset 1px 1px 2px #0001",
});

export const controlsButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  width: vars.sizes[6],
  height: vars.sizes[6],
  borderRadius: vars.radii.round,
  backgroundColor: vars.colors.accent,
  color: vars.colors.background,
  cursor: "pointer",
  transition: vars.transitions.all,
  selectors: {
    "&:disabled": {
      backgroundColor: "transparent",
      boxShadow: "none",
    },
  },
});

export const controlsDirection = style({
  display: "flex",
  marginRight: vars.space[3],
  backgroundColor: vars.colors.accentAlt,
  borderRadius: vars.radii.pill,
  boxShadow: "5px 5px 5px #0003",
  color: vars.colors.background,
  alignItems: "center",
  gap: vars.space[2],
  padding: `0 ${vars.space[2]}`,
});

import { globalStyle } from "@vanilla-extract/css";

globalStyle(`.${controlsWrapper}[data-filter-active='true'] .${controlsForm}`, {
  width: "calc(100% - 2rem)",
});

globalStyle(`.${controlsInput}::placeholder`, {
  color: vars.colors.foregroundMuted,
});

globalStyle(`.${controlsButton} svg`, {
  height: "60%",
  width: "60%",
  padding: "20%",
  fill: "currentColor",
  stroke: "currentColor",
  filter: "drop-shadow(5px 5px 5px #000D)",
  transition: vars.transitions.all,
});

globalStyle(`.${controlsButton}:disabled svg`, {
  opacity: 0.25,
});

globalStyle(`.${controlsDirection} span`, {
  display: "flex",
  margin: 0,
  fontSize: vars.fontSizes[2],
  fontWeight: 700,
  gap: vars.space[1],
  alignItems: "center",
});

globalStyle(`.${controlsDirection} span em`, {
  opacity: 0.25,
  fontStyle: "normal",
});
