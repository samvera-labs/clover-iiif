import { styled } from "src/styles/stitches.config";

const PreviewStyled = styled("div", {
  position: "absolute",
  zIndex: "2",
  width: "100%",
  opacity: "0",
  top: "0",

  variants: {
    isFocused: {
      true: {
        opacity: "1",
      },
    },
  },
});

const Overlay = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  zIndex: "1",
});

const Controls = styled("div", {
  display: "flex",
  justifyContent: "center",
  padding: "$2 $2 0",
  background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
  cursor: "default",

  button: {
    width: "$4",
    height: "$4",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadious: "100%",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",

    "&:disabled": {
      opacity: "0.2",
    },

    svg: {
      width: "100%",
      fill: "$secondary",
      stroke: "$secondary",
      color: "$secondary",
    },
  },
});

const Label = styled("div", {
  display: "flex",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.7)",
  color: "$secondaryAlt",
  fontSize: "$1",
  padding: "$1",
  cursor: "default",
});

export { Controls, Label, Overlay, PreviewStyled };
