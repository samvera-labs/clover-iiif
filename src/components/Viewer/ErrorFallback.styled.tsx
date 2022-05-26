import { styled } from "@/stitches";

const ErrorFallbackStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Headline = styled("p", {
  fontFamily: "$display",
  fontWeight: "bold",
  fontSize: "x-large",
});

const ErrorBody = styled("span", {
  fontSize: "medium",
});

export { ErrorFallbackStyled, ErrorBody, Headline };
