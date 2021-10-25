import { styled, keyframes } from "@stitches/react";
import { theme } from "theme";

const spin = keyframes({
  from: { transform: "rotate(360deg)" },
  to: { transform: "rotate(0deg)" },
});

export const NavigatorCueAnchor = styled("a", {
  display: "flex",
  flexGrow: "1",
  justifyContent: "space-between",
  margin: "0",
  padding: "0.55rem 1.618rem 0.45rem",
  lineHeight: "1.45em",
  fontSize: "1rem",
  cursor: "pointer",
  color: theme.color.primaryMuted,
  position: "relative",

  "&::before": {
    content: "",
    width: "12px",
    height: "12px",
    borderRadius: "12px",
    position: "absolute",
    backgroundColor: theme.color.primaryMuted,
    opacity: "0",
    left: "8px",
    marginTop: "5px",
  },

  "&::after": {
    content: "",
    width: "4px",
    height: "6px",
    position: "absolute",
    backgroundColor: theme.color.secondary,
    opacity: "0",
    clipPath: "polygon(100% 50%, 0 100%, 0 0)",
    left: "13px",
    marginTop: "8px",
  },

  strong: {
    marginLeft: "1rem",
  },

  "&:hover": {
    color: theme.color.accent,

    "&::before": {
      backgroundColor: theme.color.accent,
      opacity: "1",
    },

    "&::after": {
      content: "",
      width: "4px",
      height: "6px",
      position: "absolute",
      backgroundColor: theme.color.secondary,
      clipPath: "polygon(100% 50%, 0 100%, 0 0)",
      opacity: "1",
    },
  },

  "&[aria-selected='true']": {
    color: theme.color.primary,
    backgroundColor: theme.color.secondaryMuted,

    "&::before": {
      content: "",
      width: "6px",
      height: "6px",
      position: "absolute",
      backgroundColor: "transparent",
      border: `3px solid ${theme.color.accentMuted}`,
      borderRadius: "12px",
      left: "8px",
      marginTop: "4px",
      opacity: "1",
      animation: "1s linear infinite",
      animationName: spin,
    },

    "&::after": {
      content: "",
      width: "6px",
      height: "6px",
      position: "absolute",
      backgroundColor: "transparent",
      border: `3px solid ${theme.color.accent}`,
      clipPath: "polygon(100% 0, 100% 100%, 0 0)",
      borderRadius: "12px",
      left: "8px",
      marginTop: "4px",
      opacity: "1",
      animation: "1.5s linear infinite",
      animationName: spin,
    },
  },

  "&:last-child": {
    margin: "0 0 1.618rem",
  },
});
