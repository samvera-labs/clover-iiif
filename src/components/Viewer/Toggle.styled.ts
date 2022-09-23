import { styled } from "@/stitches";
import * as Switch from "@radix-ui/react-switch";

const StyledSwitch = styled(Switch.Root, {
  all: "unset",
  height: "2rem",
  width: "3.236rem",
  backgroundColor: "$secondaryAlt",
  borderRadius: "9999px",
  position: "relative",
  WebkitTapHighlightColor: "transparent",
  cursor: "pointer",

  "&:focus": {
    boxShadow: `0 0 0 2px $secondaryAlt`,
  },

  '&[data-state="checked"]': {
    backgroundColor: "$accent",
    boxShadow: `inset 2px 2px 5px #0003`,
  },
});

const StyledThumb = styled(Switch.Thumb, {
  display: "block",
  height: "calc(2rem - 6px)",
  width: "calc(2rem - 6px)",
  backgroundColor: "$secondary",
  borderRadius: "100%",
  boxShadow: `2px 2px 5px #0001`,
  transition: "$all",
  transform: "translateX(3px)",
  willChange: "transform",

  '&[data-state="checked"]': {
    transform: "translateX(calc(1.236rem + 3px))",
  },
});

const Wrapper = styled("div", {
  display: "flex",
  alignItems: "center",
});

const Label = styled("label", {
  fontFamily: "$sans",
  fontWeight: "700",
  lineHeight: "1em",
  userSelect: "none",
  cursor: "pointer",
  color: "$primary",
  opacity: "0.7",
  paddingRight: "1rem",
});

const StyledToggle = styled("form", {});

export { Label, StyledSwitch, StyledThumb, StyledToggle, Wrapper };
