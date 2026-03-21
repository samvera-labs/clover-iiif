import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const aboutRoot = style({
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: 0,
});

export const aboutContent = style({
  width: "100%",
  padding: `0 1.618rem ${vars.space[5]}`,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  position: "absolute",
  fontWeight: 400,
  fontSize: "1rem",
  zIndex: 0,
  gap: vars.space[2],
});

globalStyle(`.${aboutContent} img`, {
  maxWidth: "100px",
  maxHeight: "100px",
  objectFit: "contain",
  color: "transparent",
  marginBottom: vars.space[3],
  borderRadius: vars.radii.sm,
  backgroundColor: vars.colors.backgroundMuted,
});

globalStyle(`.${aboutContent} video`, {
  display: "none",
});

globalStyle(`.${aboutContent} a, .${aboutContent} a:visited`, {
  color: vars.colors.accent,
});

globalStyle(`.${aboutContent} p`, {
  fontSize: "1rem",
  lineHeight: "1.47em",
  margin: 0,
});

globalStyle(`.${aboutContent} dl`, {
  margin: 0,
});

globalStyle(`.${aboutContent} dl dt`, {
  fontWeight: 700,
  margin: "1rem 0 0.25rem",
});

globalStyle(`.${aboutContent} dl dd`, {
  margin: 0,
});

globalStyle(`.${aboutContent} .manifest-property-title`, {
  fontWeight: 700,
  margin: "1rem 0 0.25rem",
});

globalStyle(`.${aboutContent} ul, .${aboutContent} ol`, {
  padding: 0,
  margin: 0,
});

globalStyle(`.${aboutContent} li`, {
  fontSize: "1rem",
  lineHeight: "1.45em",
  listStyle: "none",
  margin: "0.25rem 0",
});
