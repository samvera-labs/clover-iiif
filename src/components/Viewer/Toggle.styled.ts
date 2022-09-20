import { styled } from "@/stitches";
import * as Switch from "@radix-ui/react-switch";

const StyledSwitch = styled(Switch.Root, {
  all: "unset",
  width: 42,
  height: 25,
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
  },
});

const StyledThumb = styled(Switch.Thumb, {
  display: "block",
  width: 21,
  height: 21,
  backgroundColor: "$secondary",
  borderRadius: "100%",
  boxShadow: `3px 3px 5px #0001`,
  transition: "transform 100ms",
  transform: "translateX(2px)",
  willChange: "transform",

  '&[data-state="checked"]': {
    transform: "translateX(19px)",
  },
});

// Your app...
const Flex = styled("div", { display: "flex" });

const Label = styled("label", {
  fontSize: "1rem",
  fontFamily: "$sans",
  lineHeight: "1em",
  userSelect: "none",
  cursor: "pointer",
  color: "$primaryMuted",
});

export { StyledSwitch, StyledThumb, Flex, Label };
