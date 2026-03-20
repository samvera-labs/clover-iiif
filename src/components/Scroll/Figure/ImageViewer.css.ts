import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const imageViewer = style({
  width: "100%",
  height: "100%",
  backgroundColor: vars.colors.backgroundMuted,
  backgroundSize: "contain",
  color: vars.colors.background,
  position: "relative",
  zIndex: 1,
  overflow: "hidden",
});
