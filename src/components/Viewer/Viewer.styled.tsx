import { styled } from "stitches";
import * as Collapsible from "@radix-ui/react-collapsible";

const MediaWrapper = styled("div", {
  position: "relative",
  zIndex: "0",
});

const ViewerInner = styled("div", {
  display: "flex",
  flexDirection: "row",
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
  background: "transparent",
  border: "none",
  margin: "0",
  padding: "0",
  transition: "$all",
  opacity: "1",
  marginTop: "0",

  "&[data-navigator='false']": {
    opacity: "0",
    marginTop: "-59px",
  },

  "@sm": {
    display: "flex",

    "> *": {
      display: "flex",
      flexGrow: "1",
      margin: "1rem 1rem 0",
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

  "@sm": {
    width: "100%",
  },
});

const Header = styled("header", {
  display: "flex",
  backgroundColor: "transparent !important",

  span: {
    fontSize: "1.25rem",
    fontWeight: "700",
    padding: "0 0 1rem",
    fontFamily: "$display",

    "@sm": {
      padding: "1rem",
      fontSize: "1rem",
    },
  },
});

const ViewerWrapper = styled("section", {
  display: "flex",
  flexDirection: "column",
  padding: "1.618rem",
  fontFamily: "$sans",
  backgroundColor: "$secondary",
  fontSmooth: "auto",
  webkitFontSmoothing: "antialiased",

  "> div": {
    display: "flex",
    flexDirection: "column",
    flexGrow: "1",
    justifyContent: "flex-start",

    "@sm": {
      [`& ${ViewerInner}`]: {
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

  "&[data-navigator-open='true']": {
    "@sm": {
      position: "fixed",
      height: "100%",
      width: "100%",
      top: "0",
      left: "0",

      [`& ${MediaWrapper}`]: {
        display: "none",
      },

      [`& ${CollapsibleContent}`]: {
        height: "100%",
      },
    },
  },
});

export {
  ViewerWrapper,
  ViewerInner,
  Main,
  MediaWrapper,
  CollapsibleContent,
  CollapsibleTrigger,
  Aside,
  Header,
};
