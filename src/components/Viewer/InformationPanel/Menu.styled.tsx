import { Item } from "src/components/Viewer/InformationPanel/Cue.styled";
import { styled } from "src/styles/stitches.config";

export const MenuStyled = styled("ul", {
  listStyle: "none",
  paddingLeft: "1rem",
  position: "relative",

  "&&:first-child": {
    paddingLeft: "0",
  },

  "& li ul": {
    [`& ${Item}`]: {
      backgroundColor: "unset",

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
