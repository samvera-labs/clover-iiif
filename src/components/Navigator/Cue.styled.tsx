import * as RadioGroup from "@radix-ui/react-radio-group";
import { styled, keyframes } from "stitches";

const spin = keyframes({
  from: { transform: "rotate(360deg)" },
  to: { transform: "rotate(0deg)" },
});

export const Group = styled(RadioGroup.Root, {});

export const Item = styled(RadioGroup.Item, {
  position: "relative",
  cursor: "pointer",
  display: "flex",
  width: "100%",
  flexGrow: "1",
  justifyContent: "space-between",
  textAlign: "left",
  margin: "0",
  padding: "0.55rem 1.618rem 0.45rem",
  fontFamily: "inherit",
  lineHeight: "1.25em",
  fontSize: "1rem",
  color: "$primaryMuted",
  border: "none",
  background: "none",

  "&::before": {
    content: "",
    width: "12px",
    height: "12px",
    borderRadius: "12px",
    position: "absolute",
    backgroundColor: "$primaryMuted",
    opacity: "0",
    left: "8px",
    marginTop: "5px",
    boxSizing: "content-box",
  },

  "&::after": {
    content: "",
    width: "4px",
    height: "6px",
    position: "absolute",
    backgroundColor: "$secondary",
    opacity: "0",
    clipPath: "polygon(100% 50%, 0 100%, 0 0)",
    left: "13px",
    marginTop: "8px",
    boxSizing: "content-box",
  },

  strong: {
    marginLeft: "1rem",
  },

  "&:hover": {
    color: "$accent",

    "&::before": {
      backgroundColor: "$accent",
      opacity: "1",
    },

    "&::after": {
      content: "",
      width: "4px",
      height: "6px",
      position: "absolute",
      backgroundColor: "$secondary",
      clipPath: "polygon(100% 50%, 0 100%, 0 0)",
      opacity: "1",
    },
  },

  "&[aria-checked='true']": {
    color: "$primary",
    backgroundColor: "$secondaryMuted",

    "&::before": {
      content: "",
      width: "6px",
      height: "6px",
      position: "absolute",
      backgroundColor: "transparent",
      border: "3px solid $accentMuted",
      borderRadius: "12px",
      left: "8px",
      marginTop: "4px",
      opacity: "1",
      animation: "1s linear infinite",
      animationName: spin,
      boxSizing: "content-box",
    },

    "&::after": {
      content: "",
      width: "6px",
      height: "6px",
      position: "absolute",
      backgroundColor: "transparent",
      border: "3px solid $accent",
      clipPath: "polygon(100% 0, 100% 100%, 0 0)",
      borderRadius: "12px",
      left: "8px",
      marginTop: "4px",
      opacity: "1",
      animation: "1.5s linear infinite",
      animationName: spin,
      boxSizing: "content-box",
    },
  },

  "&:last-child": {
    margin: "0 0 1.618rem",
  },
});
