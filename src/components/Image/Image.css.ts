import { globalStyle, style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const wrapper = style({
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
  position: "relative",
  zIndex: 0,
  overflow: "hidden",
});

export const navigator = style({
  position: "absolute",
  zIndex: 1,
  top: "1rem",
  left: "1rem",
  width: "161.8px",
  height: "100px",
  backgroundColor: vars.colors.overlay,
  border: `1px solid ${vars.colors.foregroundMuted}`,
  borderRadius: vars.radii.sm,
  "@media": {
    [mediaQueries.sm]: {
      width: "123px",
      height: "76px",
    },
    [mediaQueries.xs]: {
      width: "100px",
      height: "61.8px",
    },
  },
});

globalStyle(`${navigator} .displayregion`, {
  border: `2px solid ${vars.colors.accent} !important`,
  borderRadius: vars.radii.sm,
});

export const viewport = style({
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: 0,
});

const annotationSelector = ".clover-iiif-image-openseadragon-annotation";

globalStyle(`${viewport} ${annotationSelector}`, {
  position: "relative",
  backgroundColor: "transparent",
  border: `2px solid ${vars.colors.foregroundMuted}`,
  boxSizing: "content-box",
  borderRadius: vars.radii.sm,
  transition: vars.transitions.all,
  zIndex: 0,
});

globalStyle(`${viewport} ${annotationSelector} label`, {
  opacity: 0,
  position: "absolute",
  lineHeight: "1.47rem",
  pointerEvents: "none",
  textAlign: "center",
  minWidth: "300px",
  maxWidth: "20vw",
  padding: "0.5rem",
  borderRadius: vars.radii.sm,
  top: "calc(100% + 0.5rem)",
  left: "50%",
  transform: "translate(-50%, 0)",
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  transition: vars.transitions.all,
});

globalStyle(`${viewport} ${annotationSelector}[data-active="true"]`, {
  border: `2px solid ${vars.colors.accent} !important`,
  zIndex: 99999999,
});

globalStyle(
  `${viewport} ${annotationSelector}[data-active="true"] label`,
  {
    opacity: 1,
  },
);
