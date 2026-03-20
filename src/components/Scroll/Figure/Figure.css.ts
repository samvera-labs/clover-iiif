import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const scrollFigure = style({
  display: "flex",
  flexDirection: "column",
});

globalStyle(`${scrollFigure} figcaption`, {
  display: "flex",
  flexDirection: "column",
  margin: `${vars.space[5]} 0 0`,
  opacity: 0.9,
  gap: vars.space[1],
});

globalStyle(`${scrollFigure} figcaption em`, {
  fontSize: vars.fontSizes[3],
  fontStyle: "normal",
  opacity: 0.7,
});

export const scrollFigurePlaceholder = style({
  width: "100%",
});
