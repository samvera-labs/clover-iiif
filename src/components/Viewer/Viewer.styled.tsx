import { styled } from "stitches";

const ViewerWrapper = styled("section", {
  display: "flex",
  flexDirection: "column",
  padding: "1.618rem",
  fontFamily: "$sans",
  backgroundColor: "$secondary",
  fontSmooth: "auto",
  webkitFontSmoothing: "antialiased",
});

const ViewerInner = styled("div", {
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
});

const Main = styled("div", {
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "1",
  width: "61.8%",
});

const Aside = styled("aside", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  width: "38.2%",
});

const Header = styled("header", {
  display: "flex",
  backgroundColor: "transparent !important",

  span: {
    fontSize: "1.25rem",
    fontWeight: "700",
    padding: "0 0 1rem",
    fontFamily: "$display",
  },
});

export { ViewerWrapper, ViewerInner, Main, Aside, Header };
