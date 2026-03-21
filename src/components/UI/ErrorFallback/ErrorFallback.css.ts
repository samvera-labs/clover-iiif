import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const errorFallback = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[1],
  textAlign: "center",
});

export const errorHeadline = style({
  fontWeight: 700,
  fontSize: vars.fontSizes[6],
  color: vars.colors.foreground,
});

export const errorBody = style({
  fontSize: vars.fontSizes[4],
  color: vars.colors.foreground,
});
