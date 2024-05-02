import { styled } from "src/styles/stitches.config";

const ButtonStyled = styled("button", {
  textAlign: "left",

  "&:hover": {
    color: "$accent",
  },
});

const Item = styled("li", {
  margin: "0.25rem 0",
});

const List = styled("ol", {
  listStyleType: "auto",
  marginBottom: "1rem",
  listStylePosition: "inside",
});

const Container = styled("div", {
  margin: "0.5rem 1.618rem",
});

const ResultsHeader = styled("div", {
  fontWeight: "bold",
});

const ResultsFooter = styled("div", {
  marginBottom: "1rem",
});

export { Item, List, ButtonStyled, Container, ResultsHeader, ResultsFooter };
