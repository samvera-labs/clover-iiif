import { styled } from "src/styles/stitches.config";

const ErrorFallbackStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Headline = styled("p", {
  fontWeight: "bold",
  fontSize: "x-large",
});

const ErrorBody = styled("span", {
  fontSize: "medium",
});

export { ErrorFallbackStyled, ErrorBody, Headline };
