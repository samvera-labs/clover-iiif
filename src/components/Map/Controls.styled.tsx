import { styled } from "src/styles/stitches.config";

const Wrapper = styled("div", {
  position: "absolute",
  zIndex: "1",
  top: "1rem",
  right: "1rem",
  display: "flex",

  "@xs": {
    flexDirection: "column",
    zIndex: "2",
  },
});

const Item = styled("button", {
  display: "flex",
  height: "2rem",
  width: "2rem",
  borderRadius: "2rem",
  padding: "0",
  margin: "0",
  fontFamily: "inherit",
  background: "none",
  backgroundColor: "$primary",
  border: "none",
  color: "white",
  cursor: "pointer",
  marginLeft: "0.618rem",
  transition: "$all",
  boxSizing: "content-box !important",

  "&:first-child": {
    marginLeft: "0",
  },

  "@xs": {
    marginBottom: "0.618rem",
    marginLeft: "0",

    "&:last-child": {
      marginBottom: "0",
    },
  },

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$secondary",
    stroke: "$secondary",
    transition: "$all",
    boxSizing: "inherit",
  },

  "&:hover, &:focus": {
    backgroundColor: "$accent",
  },
});

export { Item, Wrapper };
