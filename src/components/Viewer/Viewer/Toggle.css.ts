import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";

export const toggleForm = style({
  display: "flex",
  flexShrink: 0,
  flexGrow: 1,
  alignItems: "center",
  marginLeft: "1.618rem",
  gap: vars.space[2],
});

export const toggleLabel = style({
  fontSize: "0.8333rem",
  fontWeight: 400,
  lineHeight: "1",
  userSelect: "none",
  cursor: "pointer",
});

export const toggleSwitch = style({
  all: "unset",
  height: "2rem",
  width: "3.236rem",
  backgroundColor: "#6663",
  borderRadius: "9999px",
  position: "relative",
  WebkitTapHighlightColor: "transparent",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.colors.backgroundAlt}`,
    },
    '&[data-state="checked"]': {
      backgroundColor: vars.colors.accent,
      boxShadow: "inset 2px 2px 5px #0003",
    },
  },
});

export const toggleThumbLabel = style({
  fontFamily: "monospace",
  fontSize: "0.8333rem",
  fontWeight: 700,
  display: "flex",
  height: "100%",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  color: vars.colors.foreground,
  opacity: 0.382,
});

export const toggleThumb = style({
  display: "block",
  height: "calc(2rem - 12px)",
  width: "calc(2rem - 12px)",
  backgroundColor: vars.colors.background,
  borderRadius: "50%",
  boxShadow: "2px 2px 5px #0001",
  transition: vars.transitions.all,
  transform: "translateX(6px)",
  willChange: "transform",
  selectors: {
    '&[data-state="checked"]': {
      transform: "translateX(calc(1.236rem + 6px))",
    },
  },
});

toggleThumb;

globalStyle(
  `.${toggleThumb}[data-state="checked"] .${toggleThumbLabel}`,
  {
    opacity: 1,
    color: vars.colors.accent,
  },
);
