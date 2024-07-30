import { IconButton } from "@radix-ui/themes";
import { styled } from "src/styles/stitches.config";

const Item = styled(IconButton, {
  cursor: "pointer",
  alignContent: "center",
  display: "inline-flex !important",

  svg: {
    color: "currentColor",
    fill: "currentColor",
    stroke: "currentColor",
    transition: "$all",
    height: "60%",
    width: "60%",
  },

  "&[data-button=rotate-right]": {
    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },

  "&[data-button=rotate-left]": {
    transform: "scaleX(-1)",

    "&:hover, &:focus": {
      svg: {
        rotate: "45deg",
      },
    },
  },

  "&[data-button=reset]": {
    "&:hover, &:focus": {
      svg: {
        rotate: "-15deg",
      },
    },
  },
});

export { Item };
