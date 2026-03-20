import { style } from "@vanilla-extract/css";
import { mediaQueries } from "src/styles/theme.css";

export const viewerWrapper = style({
  display: "flex",
  flexDirection: "column",
  WebkitFontSmoothing: "antialiased",
  selectors: {
    '&[data-absolute-position="true"]': {
      position: "absolute",
      width: "100%",
      height: "100%",
      zIndex: 0,
    },
  },
});

export const viewerRoot = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  justifyContent: "flex-start",
  height: "100%",
  maxHeight: "100%",
});

export const viewerContent = style({
  display: "flex",
  flexDirection: "row",
  flexGrow: 1,
  overflow: "hidden",
  width: "100%",
  "@media": {
    [mediaQueries.sm]: {
      flexGrow: 1,
    },
  },
});

export const viewerMain = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  flexShrink: 1,
  width: "100%",
  height: "100%",
  selectors: {
    '&[data-aside-active="true"]': {
      width: "61.8%",
      "@media": {
        [mediaQueries.sm]: {
          width: "0",
          opacity: 0,
        },
      },
    },
    '&[data-aside-toggle="false"]': {
      "@media": {
        [mediaQueries.sm]: {
          width: "100% !important",
          opacity: "1 !important",
        },
      },
    },
  },
});

export const viewerAside = style({
  display: "flex",
  flexGrow: 1,
  flexShrink: 0,
  width: 0,
  maxHeight: "100%",
  selectors: {
    '&[data-aside-active="true"]': {
      width: "38.2%",
      "@media": {
        [mediaQueries.sm]: {
          width: "100%",
        },
      },
    },
    '&[data-aside-toggle="false"]': {
      "@media": {
        [mediaQueries.sm]: {
          width: "0 !important",
        },
      },
    },
  },
});

export const viewerMediaWrapper = style({
  position: "relative",
  zIndex: 0,
});
