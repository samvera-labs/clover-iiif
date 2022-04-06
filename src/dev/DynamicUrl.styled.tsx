import { styled } from "@stitches/react";

const DynamicUrlStyled = styled("section", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2rem",
});

const ManualForm = styled("form", {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  width: "61.8%",

  label: {
    display: "block",
    marginBottom: "1rem",
    fontSize: "1.25rem",
    color: "$primary",
    fontWeight: "400",
    fontFamily: "$display",
  },

  "> div": {
    display: "flex",
    backgroundColor: "$secondaryMuted",
    position: "relative",
    width: "100%",
    borderRadius: "3px",

    input: {
      padding: "0.618rem 1rem",
      background: "transparent",
      color: "$primary",
      border: "none",
      fontFamily: "$sans",
      width: "100%",
    },

    button: {
      padding: "0.382rem 0.618rem",
      cursor: "pointer",
      position: "absolute",
      right: "0.382rem",
      alignSelf: "center",
      background: "$secondary",
      border: "none",
      fontSize: "0.7222rem",
      fontFamily: "$sans",
      fontWeight: "700",
      borderRadius: "3px",
      backgroundColor: "$secondary",
      color: "$primary",
    },
  },
});

const Curated = styled("div", {
  padding: "2rem",
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
});

const ButtonForm = styled("form", {
  button: {
    backgroundColor: "$transparent",
    border: "none",
    outline: "1px solid $secondaryMuted",
    color: "$primaryMuted",
    fontFamily: "$sans",
    fontSize: "0.8333rem",
    height: "2rem",
    padding: "0 1rem",
    borderRadius: "1rem",
    cursor: "pointer",
    margin: "0.5rem",
  },

  "&[data-active='true']": {
    button: {
      color: "$white",
      fontWeight: "700",
      backgroundColor: "$accent",
      outline: "1px solid $accent",
    },
  },
});

export { DynamicUrlStyled, Curated, ManualForm, ButtonForm };
