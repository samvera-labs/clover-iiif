import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const downloadButton = style({
  width: "30px",
  padding: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "auto",
});

export const downloadContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  fontSize: vars.fontSizes[3],
});

globalStyle(`.${downloadContent} h3`, {
  color: vars.colors.foregroundMuted,
  fontSize: vars.fontSizes[3],
  fontWeight: 700,
  margin: `${vars.space[1]} 0`,
});

globalStyle(`.${downloadContent} ul`, {
  margin: 0,
  padding: 0,
  listStyle: "none",
});

globalStyle(`.${downloadContent} ul li`, {
  marginBottom: vars.space[1],
});

globalStyle(`.${downloadContent} button`, {
  background: "transparent",
  border: "none",
  color: vars.colors.accentAlt,
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
});
