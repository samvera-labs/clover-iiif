import { globalStyle, style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const viewerHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",
});

export const viewerHeaderOptions = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  gap: vars.space[2],
  padding: vars.space[3],
  flexShrink: 0,
  flexGrow: 1,
});

export const viewerManifestLabel = style({
  fontSize: "1.33rem",
  alignSelf: "flex-start",
  flexGrow: 0,
  flexShrink: 1,
  padding: vars.space[3],
  selectors: {
    "&.visually-hidden": {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: 0,
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: 0,
    },
  },
  "@media": {
    [mediaQueries.sm]: {
      fontSize: vars.fontSizes[4],
    },
  },
});

export const viewerBadgeButton = style({
  width: "30px",
  padding: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const viewerPopoverContent = style({
  display: "flex",
  flexDirection: "column",
  fontSize: vars.fontSizes[3],
  gap: vars.space[2],
});

globalStyle(`.${viewerPopoverContent} button`, {
  display: "flex",
  textDecoration: "none",
  background: "transparent",
  border: "none",
  color: vars.colors.accentAlt,
  cursor: "pointer",
  padding: 0,
});
