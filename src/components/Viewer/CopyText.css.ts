import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const copyStatus = style({
  display: "inline-flex",
  alignItems: "center",
  padding: "0.125rem 0.25rem 0",
  marginTop: "-0.125rem",
  marginLeft: vars.space[2],
  backgroundColor: vars.colors.accent,
  color: vars.colors.background,
  borderRadius: vars.radii.sm,
  lineHeight: "1",
});
