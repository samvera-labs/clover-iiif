import { styled } from "@stitches/react";

const Item = styled("button", {
  display: "flex",
  height: "2rem",
  width: "2rem",
  borderRadius: "2rem",
  padding: "0",
  margin: "0",
  fontFamily: "inherit",
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  marginLeft: "0.618rem",
  backgroundColor: "#000D",
  filter: "drop-shadow(5px 5px 5px #0006)",
  transition: "$all",
  boxSizing: "content-box !important",

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$secondary",
    stroke: "$secondary",
    filter: "drop-shadow(5px 5px 5px #000D)",
    transition: "$all",
    boxSizing: "inherit",
  },

  "&:hover, &:focus": {
    backgroundColor: "$accent",
  },

  "&#zoomReset": {
    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },
});

export { Item };
