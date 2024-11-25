import { StyledTrigger } from "src/components/UI/Popover/Popover.styled";
import { styled } from "src/styles/stitches.config";

const StyledScrollLanguage = styled("div", {
  width: "2rem",

  [`${StyledTrigger}`]: {
    background: "$primary",
    width: "inherit",
    display: "flex",
    justifyContent: "center",
    borderRadius: "2rem",

    "&:hover": {
      background: "$accent",
    },

    svg: {
      fill: "$secondary",
    },
  },
});

export { StyledScrollLanguage };
