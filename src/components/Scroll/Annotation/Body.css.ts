import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const textualBody = style({
  selectors: {
    '&[dir=rtl]': {
      textAlign: "right",
    },
    '&[data-active-language="false"]': {
      opacity: 0,
      width: 0,
      height: 0,
    },
  },
});

globalStyle(`.${textualBody} ul`, {
  padding: vars.space[4],
});

globalStyle(`.${textualBody} li`, {
  listStyleType: "disc",
});

globalStyle(`.${textualBody} li li`, {
  listStyleType: "circle",
});

const highlightSelector = `${textualBody} span.clover-scroll-highlight`;

globalStyle(highlightSelector, {
  position: "relative",
  fontWeight: 600,
});

globalStyle(`${highlightSelector}::before`, {
  top: 0,
  position: "absolute",
  content: "",
  width: "calc(100% + 4px)",
  height: "calc(100% + 2px)",
  marginLeft: "-2px",
  borderRadius: vars.radii.sm,
  border: `1px solid ${vars.colors.foregroundMuted}`,
});

globalStyle(`${highlightSelector}::after`, {
  left: 0,
  top: 0,
  position: "absolute",
  content: "",
  width: "calc(100% + 4px)",
  height: "calc(100% + 2px)",
  marginLeft: "-2px",
  marginTop: "-1px",
  borderRadius: vars.radii.sm,
  backgroundColor: vars.colors.backgroundMuted,
  zIndex: -1,
});

globalStyle(`${highlightSelector}.active::before`, {
  borderColor: vars.colors.backgroundAlt,
});

globalStyle(`${highlightSelector}.active::after`, {
  backgroundColor: vars.colors.backgroundAlt,
});
