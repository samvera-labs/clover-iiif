import * as RadioGroup from "@radix-ui/react-radio-group";

import { keyframes, styled } from "src/styles/stitches.config";

import { annotationItemRow } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";

const spin = keyframes({
  from: { transform: "rotate(360deg)" },
  to: { transform: "rotate(0deg)" },
});

export const Group = styled(RadioGroup.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const Item = styled(RadioGroup.Item, {
  ...annotationItemRow,

  "@sm": {
    padding: "0.5rem 1rem",
    fontSize: "0.8333rem",
  },

  "&::before": {
    content: "",
    width: "12px",
    height: "12px",
    borderRadius: "12px",
    position: "absolute",
    backgroundColor: "$primaryMuted",
    opacity: "0",
    left: "8px",
    marginTop: "3px",
    boxSizing: "content-box",

    "@sm": {
      content: "unset",
    },
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
    marginTop: "6px",
    boxSizing: "content-box",

    "@sm": {
      content: "unset",
    },
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
    backgroundColor: "#6663",

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

      "@sm": {
        content: "unset",
      },
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

      "@sm": {
        content: "unset",
      },
    },
  },
});
