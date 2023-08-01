import { styled } from "src/styles/stitches.config";

const Icon = styled("div", {
  display: "flex",
  background: "none",
  border: "none",
  width: "2rem !important",
  height: "2rem !important",
  padding: "0",
  margin: "0",
  borderRadius: "2rem",
  backgroundColor: "$accent",
  color: "$secondary",
  cursor: "pointer",
  boxSizing: "content-box !important",
  transition: "$all",
  justifyContent: "center",
  alignItems: "center",

  svg: {
    height: "60%",
    width: "60%",
    fill: "$secondary",
    stroke: "$secondary",
    opacity: "1",
    filter: "drop-shadow(5px 5px 5px #000D)",
    transition: "$all",
  },
});

const ControlStyled = styled("button", {
  zIndex: "1",
  border: "none",
  cursor: "pointer",
  background: "transparent",
  marginLeft: "$2",
  padding: "0",

  [`&:disabled`]: {
    [`> ${Icon}`]: {
      backgroundColor: "$secondaryAlt",
      boxShadow: "none",

      svg: {
        fill: "$secondaryMuted",
        stroke: "$secondaryMuted",
        filter: "unset",
      },
    },
  },

  [`&:hover:enabled`]: {
    [`> ${Icon}`]: {
      backgroundColor: "$accentAlt",
      boxShadow: "3px 3px 11px #0003",

      [`&:disabled`]: {
        boxShadow: "unset",
      },
    },
  },
});

export { ControlStyled, Icon };
