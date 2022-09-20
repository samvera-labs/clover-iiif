import { styled } from "@/stitches";
import * as Switch from "@radix-ui/react-switch";

const StyledSwitch = styled(Switch.Root, {
  all: "unset",
  height: "2rem",
  width: "3.236rem",
  backgroundColor: "$secondaryAlt",
  borderRadius: "9999px",
  position: "relative",
  boxShadow: `0 2px 10px #0001`,
  WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
  cursor: "pointer",

  "&:focus": {
    boxShadow: `0 0 0 2px $secondaryAlt`,
  },

  '&[data-state="checked"]': {
    backgroundColor: "$accent",
    boxShadow: `inset 0 2px 10px #0005`,
  },
});

const StyledThumb = styled(Switch.Thumb, {
  display: "block",
  height: "calc(2rem - 6px)",
  width: "calc(2rem - 6px)",
  backgroundColor: "$secondary",
  borderRadius: "100%",
  boxShadow: `3px 3px 5px #0001`,
  transition: "transform 100ms",
  transform: "translateX(3px)",
  willChange: "transform",

  '&[data-state="checked"]': {
    transform: "translateX(calc(1.236rem + 3px))",
  },
});

// Your app...
const Flex = styled("div", { display: "flex" });

const Label = styled("label", {
  fontFamily: "$sans",
  lineHeight: "1em",
  userSelect: "none",
  cursor: "pointer",
  color: "$primary",
  opacity: "0.7",
});

export { StyledSwitch, StyledThumb, Flex, Label };
