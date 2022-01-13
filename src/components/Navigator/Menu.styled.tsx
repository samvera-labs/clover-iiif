import { styled } from "stitches";
import { Item } from "components/Navigator/Cue.styled";

export const MenuStyled = styled("ul", {
  listStyle: "none",
  paddingLeft: "1rem",
  position: "relative",

  "&&:first-child": {
    paddingLeft: "0",
  },

  "& li ul": {
    [`& ${Item}`]: {
      "&::before": {
        content: "none",
      },
      "&::after": {
        content: "none",
      },
    },
  },

  "&:first-child": {
    margin: "0 0 1.618rem",
  },
});
