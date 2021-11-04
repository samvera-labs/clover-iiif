import { styled } from "stitches";

const NavigatorWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  boxShadow: "-5px -5px 5px #00000011",
});

const NavigatorHeader = styled("header", {
  display: "flex",
  flexGrow: "0",
  margin: "0 1.618rem 0",
  borderBottom: "4px solid $secondaryAlt",
  backgroundColor: "$secondary",
});

const NavigatorBody = styled("div", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",

  "&:after": {
    position: "absolute",
    bottom: 0,
    content: "",
    width: "100%",
    height: "1rem",
    backgroundImage: `linear-gradient(0deg, #FFFFFF 0%, #FFFFFF00 100%)`,
    zIndex: 1,
  },
});

const NavigatorScroll = styled("div", {
  position: "absolute",
  overflowY: "scroll",
  height: "calc(100% - 2rem)",
  width: "100%",
  padding: "1rem 0 1rem",
});

export { NavigatorWrapper, NavigatorHeader, NavigatorBody, NavigatorScroll };
