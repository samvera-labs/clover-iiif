import { styled } from "src/styles/stitches.config";

const Form = styled("div", {
  position: "absolute",
  right: "1rem",
  top: "1rem",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: "1",
});

const Input = styled("input", {
  flexGrow: "1",
  border: "none",
  backgroundColor: "$secondaryMuted",
  color: "$primary",
  marginRight: "1rem",
  height: "2rem",
  padding: "0 1rem",
  borderRadius: "2rem",
  fontFamily: "inherit",
  fontSize: "1rem",
  lineHeight: "1rem",
  boxShadow: "inset 1px 1px 2px #0001",

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
  borderRadius: "2rem",
  backgroundColor: "$accent",
  color: "$secondary",
  cursor: "pointer",
  boxSizing: "content-box !important",
  transition: "$all",

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$secondary",
    stroke: "$secondary",
    opacity: "1",
    filter: "drop-shadow(5px 5px 5px #000D)",
    boxSizing: "inherit",
    transition: "$all",
  },

  "&:disabled": {
    backgroundColor: "transparent",
    boxShadow: "none",
    svg: { opacity: "0.25" },
  },
});

const Direction = styled("div", {
  display: "flex",
  marginRight: "0.618rem",
  backgroundColor: "$accentAlt",
  borderRadius: "2rem",
  boxShadow: "5px 5px 5px #0003",
  color: "$secondary",
  alignItems: "center",

  "> span": {
    display: "flex",
    margin: "0 0.5rem",
    fontSize: "0.7222rem",
    fontWeight: "bold",
    gap: "0.25rem",

    em: {
      opacity: "0.25",
    },
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
          width: "calc(100% - 2rem)",

          "@sm": {
            width: "calc(100% - 2rem)",
          },
        },
      },
    },
  },
});

export { Button, Direction, Form, Input, Wrapper };
