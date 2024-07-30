import { Label, Summary } from "src/components/Primitives";

import { Box } from "@radix-ui/themes";
import { styled } from "src/styles/stitches.config";

const FigureStyled = styled(Box, {
  img: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    color: "transparent",
    transition: "$all",
  },

  figcaption: {
    display: "flex",
    flexDirection: "column",
  },
  "&:hover": {
    img: {
      opacity: 0.9,
    },
  },
});

const Placeholder = styled("span", {
  display: "flex",
  width: "100%",
  height: "100%",
  backgroundColor: "var(--gray-3)",
});

export { FigureStyled, Placeholder };
