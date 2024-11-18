import { styled } from "src/styles/stitches.config";

const StyledFigure = styled("figure", {
  figcaption: {
    display: "flex",
    flexDirection: "column",
    margin: "1.618rem 0 0",
    opacity: 0.9,
    gap: "0.382rem",

    em: {
      fontSize: "0.9em",
      fontStyle: "normal",
      opacity: 0.7,
    },
  },
});

export { StyledFigure };
