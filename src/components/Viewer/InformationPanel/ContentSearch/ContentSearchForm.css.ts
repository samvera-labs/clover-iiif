import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const contentSearchForm = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  gap: vars.space[4],
  padding: `0 1.618rem ${vars.space[5]}`,
});

export const contentSearchInputWrapper = style({ flexGrow: 1 });

export const contentSearchInput = style({
  width: "100%",
  border: "none",
  backgroundColor: vars.colors.backgroundMuted,
  color: vars.colors.foreground,
  height: vars.sizes[6],
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radii.pill,
  fontFamily: "inherit",
  fontSize: vars.fontSizes[4],
  lineHeight: vars.lineHeights[4],
  boxShadow: "inset 1px 1px 2px #0001",
});

export const contentSearchButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: vars.colors.accent,
  color: vars.colors.background,
  border: "none",
  width: vars.sizes[6],
  height: vars.sizes[6],
  borderRadius: vars.radii.round,
  cursor: "pointer",
});
