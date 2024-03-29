import { styled } from "src/styles/stitches.config";

const StyledScrollFixed = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

const StyledScrollAside = styled("aside", {
  margin: "0",
  padding: "0",
  position: "relative",
  zIndex: 2,
  flexGrow: "1",
  flexShrink: "0",

  [`& ${StyledScrollFixed}`]: {
    position: "absolute",
    width: "50%",
    top: 0,
  },

  "&.anchor": {
    [`& ${StyledScrollFixed}`]: {
      position: "fixed",
      width: "50%",
    },
  },
});

const StyledScrollHeader = styled("header", {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "1",
  flexGrow: "1",
  flexShrink: "0",
  marginBottom: "1.618rem",

  strong: {
    fontWeight: "400",
    fontSize: "1.33rem",
  },
});

const StyledScrollWrapper = styled("section", {
  margin: "0",
  gap: "1rem",
});

export {
  StyledScrollAside,
  StyledScrollFixed,
  StyledScrollHeader,
  StyledScrollWrapper,
};
