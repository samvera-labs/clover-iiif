import { styled } from "src/styles/stitches.config";

const FormStyled = styled("div", {
  ".content-search-form": { display: "flex", marginBottom: "1rem" },

  input: {
    padding: ".25rem",
    marginRight: "1rem",
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
