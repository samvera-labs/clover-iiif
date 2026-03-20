import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

const slideDown = keyframes({
  "0%": { opacity: 0, transform: "translateY(1rem)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideUp = keyframes({
  "0%": { opacity: 0, transform: "translateY(1rem)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const popoverTrigger = style({
  display: "inline-flex",
  padding: `${vars.space[1]} 0`,
  marginRight: vars.space[2],
  cursor: "pointer",
  border: "none",
  background: "none",
});

export const popoverContent = style({
  border: `1px solid ${vars.colors.backgroundAlt}`,
  backgroundColor: vars.colors.background,
  padding: `${vars.space[3]} ${vars.space[4]} ${vars.space[3]} ${vars.space[3]}`,
  borderRadius: vars.radii.sm,
  minWidth: "200px",
  maxWidth: "350px",
  width: "auto",
  position: "relative",
  animationDuration: "300ms",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
});

export const popoverArrow = style({
  fill: vars.colors.backgroundAlt,
});

export const popoverClose = style({
  position: "absolute",
  right: 0,
  top: 0,
  padding: vars.space[1],
  cursor: "pointer",
  border: "none",
  background: "none",
  color: vars.colors.foreground,
  selectors: {
    "&:hover": {
      opacity: 0.75,
    },
  },
});

globalStyle(`.${popoverContent}[data-side="top"]`, {
  animationName: slideUp,
});

globalStyle(`.${popoverContent}[data-side="bottom"]`, {
  animationName: slideDown,
});

globalStyle(`.${popoverContent}[data-align="end"] .popover-arrow`, {
  marginRight: vars.space[3],
});
