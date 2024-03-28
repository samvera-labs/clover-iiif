import * as Collapsible from "@radix-ui/react-collapsible";

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

  "@sm": {
    flexDirection: "column",
  },
});

const Main = styled("div", {
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "1",
  width: "61.8%",

  "@sm": {
    width: "100%",
  },
});

const CollapsibleTrigger = styled(Collapsible.Trigger, {
  display: "none",
  border: "none",
  padding: "0",
  transition: "$all",
  opacity: "1",
  background: "#6663",
  margin: "1rem 0",
  borderRadius: "6px",

  "&[data-information-panel='false']": {
    opacity: "0",
    marginTop: "-59px",
  },

  "@sm": {
    display: "flex",

    "> span": {
      display: "flex",
      flexGrow: "1",
      fontSize: "0.8333em",
      justifyContent: "center",
      padding: "0.5rem",
      fontFamily: "inherit",
    },
  },
});

const CollapsibleContent = styled(Collapsible.Content, {
  width: "100%",
  display: "flex",
});

const Aside = styled("aside", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  width: "38.2%",
  maxHeight: "100%",

  "@sm": {
    width: "100%",
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
    "@sm": {
      position: "fixed",
      height: "100%",
      width: "100%",
      top: "0",
      left: "0",
      zIndex: "2500000000",

      [`& ${MediaWrapper}`]: {
        display: "none",
      },

      [`& ${CollapsibleTrigger}`]: {
        margin: "1rem",
      },

      [`& ${CollapsibleContent}`]: {
        height: "100%",
      },
    },
  },
});

export {
  Wrapper,
  Content,
  Main,
  MediaWrapper,
  CollapsibleContent,
  CollapsibleTrigger,
  Aside,
};
