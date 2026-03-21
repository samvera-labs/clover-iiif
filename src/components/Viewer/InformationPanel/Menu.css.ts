import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const menuList = style({
  listStyle: "none",
  paddingLeft: "1rem",
  position: "relative",
  selectors: {
    '&:first-child': {
      paddingLeft: 0,
      marginBottom: "1.618rem",
    },
  },
});

globalStyle(`.${menuList} ul`, {
  listStyle: "none",
  paddingLeft: "1rem",
});

globalStyle(`.${menuList} li`, {
  marginBottom: vars.space[1],
});
