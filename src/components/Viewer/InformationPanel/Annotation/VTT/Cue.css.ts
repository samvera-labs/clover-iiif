import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const cueGroup = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const cueItem = style({
  justifyContent: "space-between",
  textAlign: "left",
  flexGrow: 1,
  margin: 0,
  marginLeft: "-1rem",
  padding: "0.618rem 1rem",
  width: "calc(100% + 2rem)",
  fontSize: "1rem",
});

globalStyle(`.${cueItem} strong`, {
  marginLeft: "1rem",
});

globalStyle(`.${cueItem}:hover`, {
  color: vars.colors.accent,
});

globalStyle(`.${cueItem}[aria-checked='true']`, {
  background: "#6662",
});
