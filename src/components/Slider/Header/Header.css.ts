import { globalStyle, style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const sliderHeader = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingBottom: vars.space[4],
  lineHeight: vars.lineHeights[5],
  gap: vars.space[3],
  alignItems: "flex-end",
  "@media": {
    [mediaQueries.xs]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
});

export const sliderHeaderContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const sliderHeaderControls = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: vars.space[2],
  paddingLeft: vars.space[5],
  paddingRight: vars.space[4],
  "@media": {
    [mediaQueries.xs]: {
      width: "100%",
      justifyContent: "center",
      padding: `${vars.space[4]} ${vars.space[1]} 0 0`,
      flexWrap: "wrap",
    },
  },
});

export const sliderHeaderLabel = style({
  fontSize: vars.fontSizes[6],
  fontWeight: 400,
});

export const sliderHeaderSummary = style({
  fontSize: vars.fontSizes[4],
  marginTop: vars.space[2],
  color: vars.colors.foreground,
});

export const sliderControlIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: vars.colors.accent,
  borderRadius: vars.radii.round,
  color: vars.colors.background,
  height: vars.sizes[6],
  width: vars.sizes[6],
  transition: vars.transitions.all,
});

globalStyle(`.${sliderControlIcon} svg`, {
  width: "60%",
  height: "60%",
  fill: "currentColor",
  stroke: "currentColor",
  transition: vars.transitions.all,
});

export const sliderControlButton = style({
  background: "transparent",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  padding: 0,
  selectors: {
    "&:disabled": {
      cursor: "not-allowed",
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.colors.accentMuted}`,
      outlineOffset: "2px",
    },
  },
});

globalStyle(`.${sliderControlButton}:disabled .${sliderControlIcon}`, {
  backgroundColor: vars.colors.backgroundAlt,
  color: vars.colors.foregroundAlt,
});

globalStyle(
  `.${sliderControlButton}:hover:not(:disabled) .${sliderControlIcon}, .${sliderControlButton}:focus-visible:not(:disabled) .${sliderControlIcon}`,
  {
    backgroundColor: vars.colors.accentAlt,
  },
);

export const sliderViewAll = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: vars.colors.accent,
  color: vars.colors.background,
  height: vars.sizes[6],
  paddingLeft: vars.space[3],
  paddingRight: vars.space[3],
  borderRadius: vars.radii.pill,
  cursor: "pointer",
  transition: vars.transitions.all,
  textDecoration: "none",
  fontSize: vars.fontSizes[3],
  whiteSpace: "nowrap",
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.accentAlt,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.colors.accentMuted}`,
      outlineOffset: "2px",
    },
  },
});

globalStyle(`${sliderHeader} .clover-slider-header-homepage`, {
  textDecoration: "none",
  color: "inherit",
});
