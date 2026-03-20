import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const preview = style({
  position: "absolute",
  zIndex: 2,
  width: "100%",
  opacity: 0,
  top: 0,
  transition: vars.transitions.all,
});

export const previewVisible = style({
  opacity: 1,
});

export const previewOverlay = style({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  zIndex: 1,
});

export const previewControls = style({
  display: "flex",
  justifyContent: "center",
  padding: `${vars.space[2]} ${vars.space[2]} 0`,
  backgroundImage: `linear-gradient(0deg, ${vars.colors.overlay} 0%, transparent 100%)`,
  gap: vars.space[2],
});

globalStyle(`.${previewControls} button`, {
  width: vars.sizes[6],
  height: vars.sizes[6],
  display: "flex",
  flexDirection: "column",
  textAlign: "center",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: vars.radii.round,
  backgroundColor: "transparent",
  border: `1px solid ${vars.colors.backgroundMuted}`,
  cursor: "pointer",
  color: vars.colors.background,
  transition: vars.transitions.all,
});

globalStyle(`.${previewControls} button:disabled`, {
  opacity: 0.4,
  cursor: "not-allowed",
});

globalStyle(
  `.${previewControls} button:not(:disabled):hover, .${previewControls} button:not(:disabled):focus-visible`,
  {
    backgroundColor: vars.colors.accent,
    borderColor: vars.colors.accent,
    color: vars.colors.background,
  },
);

globalStyle(`.${previewControls} button:focus-visible`, {
  outline: `2px solid ${vars.colors.accentMuted}`,
  outlineOffset: "2px",
});

globalStyle(`.${previewControls} button svg`, {
  width: "100%",
  fill: "currentColor",
  stroke: "currentColor",
});

export const previewLabel = style({
  display: "flex",
  justifyContent: "center",
  backgroundColor: vars.colors.overlay,
  color: vars.colors.background,
  fontSize: vars.fontSizes[2],
  padding: vars.space[1],
  cursor: "default",
});
