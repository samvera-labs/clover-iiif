import { styled } from "stitches";

const Form = styled("div", {
  position: "absolute",
  right: "1rem",
  top: "1rem",
  display: "flex",
  justifyContent: "flex-end",
});

const Input = styled("input", {
  flexGrow: "1",
  border: "none",
  outline: "none",
  backgroundColor: "$secondaryMuted",
  color: "$primary",
  marginRight: "1rem",
  height: "2rem",
  padding: "0 1rem",
  borderRadius: "2rem",
  fontFamily: "$sans",
  fontSize: "1rem",
  lineHeight: "1rem",
  boxShadow: "inset 1px 1px 2px #0003",

  "&::placeholder": {
    color: "$primaryMuted",
  },
});

const Button = styled("button", {
  display: "flex",
  background: "none",
  border: "none",
  width: "2rem !important",
  height: "2rem !important",
  padding: "0",
  margin: "0",
  fontWeight: "700",
  borderRadius: "50%",
  backgroundColor: "$accent",
  color: "$secondary",
  boxShadow: "5px 5px 5px #0003",
  cursor: "pointer",
  boxSizing: "content-box !important",

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$secondary",
    stroke: "$secondary",
    filter: "drop-shadow(5px 5px 5px #000D)",
    boxSizing: "inherit",
  },
});

const Controls = styled("div", {
  display: "flex",

  [`& ${Button}`]: {
    marginLeft: "0.618rem",
  },
});

const Wrapper = styled("div", {
  display: "flex",
  position: "relative",
  zIndex: "1",
  width: "100%",
  padding: "0",
  transition: "$all",

  variants: {
    isToggle: {
      true: {
        paddingTop: "2.618rem",

        [`& ${Form}`]: {
          width: "calc(100% - 1rem)",

          "@sm": {
            width: "calc(100% - 2rem)",
          },
        },

        [`& ${Button}`]: {
          backgroundColor: "$primaryMuted",
        },
      },
    },
  },
});

export { Button, Controls, Form, Input, Wrapper };
