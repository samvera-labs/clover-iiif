import { styled } from "src/styles/stitches.config";

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
  filter: "drop-shadow(2px 2px 5px #0003)",
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
    filter: "drop-shadow(2px 2px 5px #0003)",
    transition: "$all",
    boxSizing: "inherit",
  },

  "&:hover, &:focus": {
    backgroundColor: "$accent",
  },

  "&[data-button=rotate-right]": {
    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },

  "&[data-button=rotate-left]": {
    transform: "scaleX(-1)",

    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },

  "&[data-button=reset]": {
    "&:hover, &:focus": {
      svg: {
        rotate: "-15deg",
      },
    },
  },
});

export { Item };
