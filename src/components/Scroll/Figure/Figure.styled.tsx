import { styled } from "src/styles/stitches.config";

const StyledFigure = styled("figure", {
  figcaption: {
    display: "flex",
    flexDirection: "column",
    margin: "1.618rem 0 0",
    opacity: 0.9,

    em: {
      fontSize: "0.9em",
      fontStyle: "normal",
      opacity: 0.7,
    },
  },
});

export { StyledFigure };
