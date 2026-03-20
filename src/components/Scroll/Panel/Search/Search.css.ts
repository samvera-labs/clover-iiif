import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const searchContainer = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[1],
  selectors: {
    '&[data-active="true"]': {
      paddingRight: vars.space[1],
    },
  },
});

globalStyle(`.${searchContainer} button`, {
  fontSize: vars.fontSizes[3],
  fill: vars.colors.background,
  color: vars.colors.background,
  stroke: vars.colors.background,
  backgroundColor: "transparent",
  border: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: vars.radii.round,
  height: vars.sizes[6],
  width: vars.sizes[6],
});

globalStyle(`.${searchContainer} button svg`, {
  fill: "inherit",
  color: "inherit",
  stroke: "inherit",
  width: "1.25em",
});

export const searchIcon = style({
  border: "none",
  background: "transparent",
  color: vars.colors.background,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radii.round,
  height: vars.sizes[6],
  width: vars.sizes[6],
  transition: vars.transitions.all,
});

globalStyle(`.${searchIcon} svg`, {
  color: "inherit",
  fill: "inherit",
  stroke: "inherit",
});

globalStyle(`.${searchIcon}:focus-visible`, {
  outline: `2px solid ${vars.colors.accentMuted}`,
  outlineOffset: "2px",
});

export const searchInput = style({
  margin: 0,
  background: "none",
  zIndex: 2,
  justifyContent: "center",
  display: "flex",
  alignItems: "center",
  fontSize: vars.fontSizes[4],
  fontFamily: "inherit",
  outline: "none",
  border: "none",
  color: vars.colors.background,
  flexGrow: 1,
  minWidth: 0,
});

globalStyle(`.${searchInput}::placeholder`, {
  color: vars.colors.backgroundAlt,
});

export const searchForm = style({
  display: "flex",
  justifyContent: "space-between",
  transition: vars.transitions.all,
  flexGrow: 1,
  height: vars.sizes[6],
  alignItems: "center",
  borderRadius: vars.radii.pill,
  paddingRight: vars.space[1],
});

export const searchFormExpanded = style({
  backgroundColor: "transparent",
});

globalStyle(`.${searchFormExpanded} .${searchIcon}`, {
  marginLeft: 0,
  cursor: "text",
});

globalStyle(`.${searchFormExpanded} .${searchInput}`, {
  width: "100%",
  padding: `0 ${vars.space[3]} 0 ${vars.space[4]}`,
  cursor: "text",
});

export const searchFormCollapsed = style({
});

globalStyle(`.${searchFormCollapsed}:hover`, {
  backgroundColor: vars.colors.accent,
});

globalStyle(`.${searchFormCollapsed} .${searchIcon}`, {
  cursor: "pointer",
});

globalStyle(`.${searchFormCollapsed} .${searchInput}`, {
  cursor: "pointer",
});

globalStyle(`.${searchFormCollapsed} .${searchInput}::placeholder`, {
  color: "transparent",
});

export const searchBackButton = style({
  opacity: 1,
  alignSelf: "center",
  marginLeft: vars.space[1],
  flexShrink: 0,
  border: "none",
  background: "transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radii.round,
  height: vars.sizes[6],
  width: vars.sizes[6],
  color: vars.colors.background,
  selectors: {
    '&[aria-disabled="true"]': {
      opacity: 0,
      display: "none",
    },
  },
});

globalStyle(`.${searchBackButton} svg`, {
  fill: "inherit",
  color: "inherit",
});

globalStyle(`.${searchBackButton}:focus-visible`, {
  outline: `2px solid ${vars.colors.accentMuted}`,
  outlineOffset: "2px",
});

export const searchAnnotations = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
});

globalStyle(`.${searchAnnotations} button`, {
  backgroundColor: vars.colors.backgroundMuted,
  opacity: 0.8,
  transition: vars.transitions.all,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  fontSize: vars.fontSizes[3],
  lineHeight: vars.lineHeights[4],
  textAlign: "left",
  borderRadius: vars.radii.pill,
  border: `1px solid ${vars.colors.backgroundAlt}`,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  color: vars.colors.foreground,
  cursor: "pointer",
});

globalStyle(`.${searchAnnotations} button:hover`, {
  opacity: 1,
});

globalStyle(`.${searchAnnotations} button[data-result='true']`, {
  backgroundColor: vars.colors.backgroundAlt,
  borderColor: vars.colors.backgroundAlt,
  opacity: 1,
});

export const searchAnnotationInformation = style({
  display: "flex",
  gap: vars.space[1],
  fontSize: vars.fontSizes[3],
});

export const searchTag = style({
  fontWeight: 700,
});

export const searchResultsLabel = style({
  fontSize: vars.fontSizes[3],
  color: vars.colors.backgroundAlt,
  margin: `0 ${vars.space[2]}`,
});
