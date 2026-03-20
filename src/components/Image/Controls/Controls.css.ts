import { style, globalStyle } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const controlsWrapper = style({
  position: "absolute",
  top: vars.space[4],
  right: vars.space[4],
  display: "flex",
  gap: vars.space[2],
  zIndex: 1,
  "@media": {
    [mediaQueries.xs]: {
      flexDirection: "column",
      zIndex: 2,
    },
  },
});

export const controlsWrapperWithPlaceholder = style({
  right: `calc(${vars.space[8]} - ${vars.space[2]})`,
  "@media": {
    [mediaQueries.xs]: {
      top: `calc(${vars.space[8]} - ${vars.space[2]})`,
    },
  },
});

export const controlButton = style({
  alignItems: "center",
  backgroundColor: vars.colors.overlay,
  border: `1px solid transparent`,
  borderRadius: vars.radii.round,
  color: vars.colors.background,
  cursor: "pointer",
  display: "inline-flex",
  height: vars.sizes[6],
  justifyContent: "center",
  minWidth: vars.sizes[6],
  padding: 0,
  transition: vars.transitions.all,
  width: vars.sizes[6],
  selectors: {
    "&:hover:not(:disabled), &:focus-visible:not(:disabled)": {
      backgroundColor: vars.colors.accent,
      color: vars.colors.background,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.colors.accentMuted}`,
      outlineOffset: "2px",
    },
    "&:disabled": {
      cursor: "not-allowed",
      backgroundColor: vars.colors.foregroundAlt,
      color: vars.colors.backgroundMuted,
      opacity: 0.7,
    },
  },
});

globalStyle(`.${controlButton} svg`, {
  height: "60%",
  width: "60%",
  fill: "currentColor",
  stroke: "currentColor",
  transition: vars.transitions.all,
});

globalStyle(`.${controlButton}[data-button="rotate-left"] svg`, {
  transform: "scaleX(-1)",
});

globalStyle(
  `.${controlButton}[data-button="rotate-right"]:hover svg, .${controlButton}[data-button="rotate-right"]:focus-visible svg`,
  {
    transform: "rotate(45deg)",
  },
);

globalStyle(
  `.${controlButton}[data-button="rotate-left"]:hover svg, .${controlButton}[data-button="rotate-left"]:focus-visible svg`,
  {
    transform: "scaleX(-1) rotate(45deg)",
  },
);

globalStyle(
  `.${controlButton}[data-button="reset"]:hover svg, .${controlButton}[data-button="reset"]:focus-visible svg`,
  {
    transform: "rotate(-15deg)",
  },
);
