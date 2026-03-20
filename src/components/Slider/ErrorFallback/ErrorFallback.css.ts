import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const errorFallback = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[1],
});

export const errorHeadline = style({
  fontWeight: 700,
  fontSize: vars.fontSizes[5],
});

export const errorBody = style({
  color: vars.colors.foreground,
});
