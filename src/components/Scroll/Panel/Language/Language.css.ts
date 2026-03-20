import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const languageMenu = style({
  width: vars.sizes[6],
  height: vars.sizes[6],
});

export const languageTrigger = style({
  width: "inherit",
  height: "inherit",
  display: "flex",
  justifyContent: "center",
  borderRadius: vars.radii.round,
  padding: 0,
  alignItems: "center",
  backgroundColor: vars.colors.foreground,
  border: `1px solid ${vars.colors.foregroundMuted}`,
  transition: vars.transitions.all,
  cursor: "pointer",
});

globalStyle(`.${languageTrigger} svg`, {
  fill: vars.colors.background,
});

export const languageContent = style({
  backgroundColor: vars.colors.foreground,
  padding: `${vars.space[3]} ${vars.space[4]} ${vars.space[3]} ${vars.space[3]}`,
  borderRadius: vars.radii.sm,
  color: vars.colors.background,
});

globalStyle(`.${languageContent} > label`, {
  fontSize: vars.fontSizes[3],
  display: "flex",
  marginBottom: vars.space[2],
});

export const languageOption = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[1],
  backgroundColor: "transparent",
  border: "none",
  fontFamily: "inherit",
  fontSize: vars.fontSizes[4],
  marginTop: vars.space[1],
  color: vars.colors.background,
});

export const languageOptionCheckbox = style({
  width: vars.sizes[2],
  height: vars.sizes[2],
  borderRadius: vars.radii.sm,
  backgroundColor: vars.colors.backgroundMuted,
  border: `1px solid ${vars.colors.backgroundAlt}`,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: vars.fontSizes[2],
  color: vars.colors.foreground,
});

export const languageOptionIndicator = style({
  color: vars.colors.foreground,
});

globalStyle(`.${languageOption}[data-state='checked'] .${languageOptionCheckbox}`, {
  backgroundColor: vars.colors.accent,
  borderColor: vars.colors.accent,
  color: vars.colors.background,
});

globalStyle(`.${languageTrigger}:hover`, {
  backgroundColor: vars.colors.accent,
  borderColor: vars.colors.accent,
});

globalStyle(`.${languageTrigger}:focus-visible`, {
  outline: `2px solid ${vars.colors.accentMuted}`,
  outlineOffset: "2px",
});
