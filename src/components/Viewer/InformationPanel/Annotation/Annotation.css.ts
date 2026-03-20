import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const annotationItemRow = style({
  position: "relative",
  display: "flex",
  margin: "0 1.618rem",
  padding: "0.5rem 0",
  fontFamily: "inherit",
  fontSize: "0.8333rem",
  lineHeight: "1.47rem",
  color: "inherit",
  background: "none",
  borderRadius: vars.radii.sm,
  border: "none",
});

export const annotationButton = style({
  textAlign: "left",
  cursor: "pointer",
});

globalStyle(`.${annotationButton}:hover`, {
  color: vars.colors.accent,
});

export const annotationGroup = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  paddingBottom: vars.space[4],
  marginBottom: vars.space[4],
  borderBottom: "1px solid #0001",
});

globalStyle(`.${annotationGroup} header`, {
  margin: "0 1.618rem 0.5rem",
  fontWeight: 700,
  fontSize: "0.8333rem",
});

globalStyle(`.${annotationGroup} header em`, {
  fontStyle: "normal",
  fontWeight: 400,
  opacity: 0.7,
});

export const annotationContent = style({
  gap: vars.space[3],
  fontSize: "1rem",
  lineHeight: "1.47em",
  margin: 0,
});

globalStyle(`.${annotationContent}[data-content-search='true'] em`, {
  fontWeight: 700,
  display: "inline",
});

export const annotationItem = style({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
});

globalStyle(`.${annotationItem}[data-format='text/vtt']`, {
  marginTop: "-1rem",
});

globalStyle(`.${annotationItem}[data-format='text/vtt'] > span`, {
  display: "none",
});

globalStyle(`.${annotationItem} > span`, {
  display: "flex",
  width: "2rem",
  height: "2rem",
  backgroundColor: "#0001",
  flexShrink: 0,
  borderRadius: vars.radii.sm,
  marginTop: "0.25rem",
});

globalStyle(`.${annotationItem}[dir='rtl'] .${annotationContent}`, {
  textAlign: "right",
});
