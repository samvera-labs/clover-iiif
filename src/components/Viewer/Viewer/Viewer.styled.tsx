import { styled } from "src/styles/stitches.config";

const MediaWrapper = styled("div", {
  position: "relative",
  zIndex: "0",
});

const Content = styled("div", {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  overflow: "hidden",
});

const Main = styled("div", {
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "1",
  width: "100%",
  height: "100%",

  "&[data-aside-active='true']": {
    width: "61.8%",

    "@sm": {
      width: "0",
      opacity: "0",
    },
  },

  "&[data-aside-toggle='false']": {
    "@sm": {
      width: "100% !important",
      opacity: "1 !important",
    },
  },
});

const Aside = styled("aside", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  width: "0",
  maxHeight: "100%",

  "&[data-aside-active='true']": {
    width: "38.2%",

    "@sm": {
      width: "100%",
    },
  },

  "&[data-aside-toggle='false']": {
    "@sm": {
      width: "0 !important",
    },
  },
});

const Wrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  fontSmooth: "auto",
  webkitFontSmoothing: "antialiased",

  '&[data-absolute-position="true"]': {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: "0",
  },

  "> div": {
    display: "flex",
    flexDirection: "column",
    flexGrow: "1",
    justifyContent: "flex-start",
    height: "100%",
    maxHeight: "100%",

    "@sm": {
      [`& ${Content}`]: {
        flexGrow: "1",
      },

      [`& ${Main}`]: {
        flexGrow: "0",
      },
    },
  },

  "@sm": {
    padding: "0",
  },

  "&[data-information-panel-open='true']": {
    "@sm": {},
  },
});

export { Wrapper, Content, Main, MediaWrapper, Aside };
