import { globalStyle, style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const paintingRoot = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  flexShrink: 1,
  gap: "1rem",
  zIndex: 0,
  overflow: "hidden",
});

export const paintingCanvas = style({
  width: "100%",
  height: "100%",
});

export const paintingPlaceholder = style({
  position: "absolute",
  background: "none",
  border: "none",
  cursor: "zoom-in",
  margin: 0,
  padding: 0,
  width: "100%",
  height: "100%",
  transition: vars.transitions.all,
  opacity: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  selectors: {
    '&[data-active="false"]': {
      opacity: 0,
    },
    '&[data-media="true"]': {
      cursor: "pointer",
    },
  },
});

globalStyle(`.${paintingPlaceholder} img`, {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  color: "transparent",
  aspectRatio: "auto",
});

globalStyle(`.${paintingPlaceholder}[data-paged="true"] img:first-of-type`, {
  objectPosition: "100% 50%",
});

globalStyle(`.${paintingPlaceholder}[data-paged="true"] img:last-of-type`, {
  objectPosition: "0 50%",
});

export const paintingToggle = style({
  position: "absolute",
  width: "2rem",
  height: "2rem",
  top: "1rem",
  right: "1rem",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  backgroundColor: vars.colors.accent,
  color: vars.colors.background,
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  transition: vars.transitions.all,
  selectors: {
    '&[data-media="true"][data-interactive="false"]': {
      top: "50%",
      right: "50%",
      width: "4rem",
      height: "4rem",
      transform: "translate(50%,-50%)",
    },
  },
});

globalStyle(`.${paintingToggle} svg`, {
  height: "60%",
  width: "60%",
  fill: "currentColor",
  stroke: "currentColor",
});

globalStyle(`.${paintingRoot}:hover .${paintingToggle}`, {
  backgroundColor: vars.colors.accent,
});

globalStyle(`.${paintingRoot}:hover .${paintingPlaceholder}`, {
  backgroundColor: "#6662",
});
