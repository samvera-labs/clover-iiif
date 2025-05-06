import { styled } from "src/styles/stitches.config";

const FormStyled = styled("div", {
  form: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
    gap: "1rem",
    padding: "0 1.618rem 1.618rem",

    ".content-search-input": {
      flexGrow: "1",

      input: {
        width: "100%",
        border: "none",
        backgroundColor: "$secondaryMuted",
        color: "$primary",
        marginRight: "1rem",
        height: "2rem",
        padding: "0 1rem",
        borderRadius: "1rem",
        fontFamily: "inherit",
        fontSize: "1rem",
        lineHeight: "1rem",
        boxShadow: "inset 1px 1px 2px #0001",

        "&::placeholder": {
          color: "#0006",
        },
      },
    },
  },
});

const ButtonStyled = styled("button", {
  display: "flex",
  background: "none",
  border: "none",
  width: "2rem",
  height: "2rem",
  padding: "0",
  margin: "0",
  fontWeight: "700",
  borderRadius: "2rem",
  backgroundColor: "$accent",
  color: "$secondary",
  cursor: "pointer",
  boxSizing: "content-box",
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

export { FormStyled, ButtonStyled };
