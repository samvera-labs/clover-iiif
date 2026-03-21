import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const placeholderWrapper = style({
  position: "absolute",
  width: "100%",
  top: 0,
  left: 0,
  overflow: "hidden",
  backgroundColor: vars.colors.backgroundMuted,
});

export const placeholderBackground = style({
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "50% 50%",
  filter: "blur(3em)",
  opacity: 0.7,
});
