import { style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const scrollItemFigure = style({
  transition: vars.transitions.all,
  flexShrink: 0,
  opacity: 1,
  transform: "none",
});

export const scrollItem = style({
  transition: vars.transitions.all,
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  gap: vars.space[7],
});

export const scrollItems = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const scrollItemTextualBodies = style({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  justifyContent: "flex-start",
});

export const languageColumns = style({
  display: "flex",
  flexDirection: "row",
  gap: vars.space[7],
  width: "100%",
});

export const languageColumn = style({
  width: "calc(100% / var(--num-items, 1))",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  minWidth: 0,
});

export const pageBreak = style({
  margin: 0,
  borderColor: "transparent",
  height: vars.space[5],
  position: "relative",
  width: "61.8%",
  zIndex: 0,
  marginLeft: "38.2%",
  display: "flex",
  justifyContent: "flex-end",
  selectors: {
    "&::after": {
      content: "",
      width: "calc(100% - 2.618em)",
      bottom: 0,
      position: "absolute",
      zIndex: 0,
      height: "2px",
      backgroundColor: vars.colors.backgroundAlt,
      opacity: 0.5,
    },
  },
});
