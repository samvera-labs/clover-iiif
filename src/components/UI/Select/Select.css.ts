import { globalStyle, style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const selectRoot = style({
  position: "relative",
  zIndex: 5,
  width: "100%",
});

export const selectTrigger = style({
  fontSize: vars.fontSizes[6],
  fontWeight: 400,
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: vars.radii.sm,
  border: `1px solid ${vars.colors.foregroundMuted}`,
  paddingLeft: vars.space[2],
  paddingRight: vars.space[2],
  minHeight: vars.sizes[6],
  backgroundColor: vars.colors.background,
  cursor: "pointer",
  transition: vars.transitions.all,
  width: "100%",
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.accentMuted}`,
      outlineOffset: "2px",
    },
  },
  "@media": {
    [mediaQueries.sm]: {
      fontSize: vars.fontSizes[4],
    },
  },
});

export const selectIcon = style({
  height: vars.sizes[5],
  width: vars.sizes[5],
  color: vars.colors.accent,
  fill: vars.colors.accent,
  stroke: vars.colors.accent,
  marginLeft: vars.space[1],
});

export const selectContent = style({
  borderRadius: vars.radii.sm,
  backgroundColor: vars.colors.background,
  border: `1px solid ${vars.colors.backgroundAlt}`,
  marginTop: vars.space[3],
  paddingBottom: vars.space[1],
  maxWidth: "90vw",
  overflow: "hidden",
});

globalStyle(`.${selectContent} ul`, {
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const selectLabel = style({
  color: vars.colors.foregroundMuted,
  fontFamily: "inherit",
  fontSize: vars.fontSizes[3],
  padding: `${vars.space[2]} ${vars.space[3]}`,
  backgroundColor: vars.colors.backgroundMuted,
});

export const selectItem = style({
  display: "flex",
  alignItems: "center",
  fontFamily: "inherit",
  padding: `${vars.space[1]} ${vars.space[2]}`,
  color: vars.colors.foreground,
  fontWeight: 400,
  fontSize: vars.fontSizes[3],
  cursor: "pointer",
  width: "100%",
  backgroundColor: vars.colors.background,
  columnGap: vars.space[2],
  selectors: {
    '&[data-state="checked"]': {
      fontWeight: 600,
      color: vars.colors.accent,
    },
    '&:hover': {
      color: vars.colors.accent,
    },
  },
});

globalStyle(`.${selectItem} span`, {
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
});

globalStyle(`.${selectItem} img`, {
  width: vars.sizes[4],
  height: vars.sizes[4],
  borderRadius: vars.radii.sm,
});
