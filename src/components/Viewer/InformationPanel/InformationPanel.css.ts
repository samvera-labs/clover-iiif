import { style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const infoPanelRoot = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: 1,
  flexShrink: 0,
  position: "relative",
  zIndex: 1,
  maskImage: "linear-gradient(180deg, rgba(0, 0, 0, 1) calc(100% - 2rem), transparent 100%)",
  "@media": {
    [mediaQueries.sm]: {
      marginTop: "0.5rem",
      boxShadow: "none",
    },
  },
});

export const infoPanelList = style({
  display: "flex",
  flexGrow: 0,
  margin: "0 1.618rem",
  borderBottom: "5px solid #6663",
  gap: vars.space[1],
  "@media": {
    [mediaQueries.sm]: {
      margin: "0 1rem",
    },
  },
});

export const infoPanelTrigger = style({
  display: "flex",
  position: "relative",
  padding: "0.5rem 1.618rem",
  background: "none",
  border: "none",
  opacity: 0.7,
  fontSize: "1rem",
  lineHeight: "1rem",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontWeight: 400,
  transition: vars.transitions.all,
  selectors: {
    '&[data-state="active"]': {
      opacity: 1,
      fontWeight: 700,
    },
    '&::after': {
      content: "",
      position: "absolute",
      bottom: "-4px",
      left: 0,
      width: 0,
      height: "4px",
      transition: vars.transitions.all,
    },
    '&[data-state="active"]::after': {
      width: "100%",
      backgroundColor: vars.colors.accent,
    },
    '&[data-value="manifest-back"]': {
      display: "none",
    },
  },
  "@media": {
    [mediaQueries.sm]: {
      selectors: {
        '&[data-value="manifest-back"]': {
          display: "block",
        },
      },
    },
  },
});

export const infoPanelContent = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  flexShrink: 0,
  position: "absolute",
  top: 0,
  left: 0,
  selectors: {
    '&[data-state="active"]': {
      width: "100%",
      height: "calc(100% - 2rem)",
      padding: "1.618rem 0",
    },
  },
});

export const infoPanelScroll = style({
  position: "relative",
  height: "100%",
  width: "100%",
  overflowY: "auto",
});
