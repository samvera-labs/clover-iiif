import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const scrollWrapper = style({
  margin: 0,
  position: "relative",
  zIndex: 0,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const scrollHeader = style({
  paddingBottom: vars.space[5],
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  zIndex: 2,
  alignItems: "flex-end",
});

globalStyle(`${scrollHeader} .clover-scroll-header-label`, {
  fontWeight: 400,
  fontSize: vars.fontSizes[6],
});

export const scrollPanel = style({
  position: "absolute",
  zIndex: 10,
  overflow: "hidden",
  height: vars.sizes[6],
  display: "inline-flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const scrollSearch = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: vars.colors.foreground,
  borderRadius: vars.radii.pill,
  border: `1px solid ${vars.colors.foregroundMuted}`,
  paddingLeft: vars.space[1],
  paddingRight: vars.space[1],
});
