import { styled } from "@/stitches";

const InformationContent = styled("div", {
  boxShadow: "inset -5px 5px 5px #0001",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  width: "calc(100% - 4rem)",
  height: "calc(100% - 4rem)",
  overflow: "scroll",
  position: "absolute",
  color: "$primary",
  fontFamily: "$sans",
  fontWeight: "400",
  fontSize: "1rem",
  zIndex: "0",

  "a, a:visited": {
    color: "$accent",
  },

  p: {
    fontSize: "1rem",
    lineHeight: "1.45em",
    margin: "0",
  },

  dl: {
    margin: "0",

    dt: {
      fontWeight: "700",
      margin: "1rem 0 0.25rem",
    },

    dd: {
      margin: "0",
    },
  },

  ".manifest-property-title": {
    fontWeight: "700",
    margin: "1rem 0 0.25rem",
  },

  "ul, ol": {
    padding: "0",
    margin: "0",

    li: {
      fontSize: "1rem",
      lineHeight: "1.45em",
      listStyle: "none",
      margin: "0.25rem 0 0.25rem",
    },
  },
});

const InformationStyled = styled("div", {
  boxShadow: "-5px -5px 5px #0001",
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

export { InformationContent, InformationStyled };
