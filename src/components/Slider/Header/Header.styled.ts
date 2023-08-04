import { styled } from "src/styles/stitches.config";

const HeaderContent = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const HeaderControls = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: "$5",
  paddingRight: "$4",

  "@xs": {
    width: "100%",
    justifyContent: "center",
    padding: "$4 $1 0 0",
  },
});

const HeaderStyled = styled("div", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingBottom: "$4",
  margin: "0",
  lineHeight: "1.4em",
  alignItems: "flex-end",

  "@xs": {
    flexDirection: "column",
  },

  ".clover-slider-header-homepage": {
    color: "$accent",
    textDecoration: "none",
  },

  ".clover-slider-header-label": {
    fontSize: "1.25rem",
    fontWeight: "400",
  },

  ".clover-slider-header-summary": {
    fontSize: "$4",
    marginTop: "$2",
  },
});

export { HeaderContent, HeaderControls, HeaderStyled };
