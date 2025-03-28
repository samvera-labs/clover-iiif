import * as Switch from "@radix-ui/react-switch";

import { styled } from "src/styles/stitches.config";

const StyledSwitch = styled(Switch.Root, {
  all: "unset",
  height: "2rem",
  width: "3.236rem",
  backgroundColor: "#6663",
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
  height: "calc(2rem - 12px)",
  width: "calc(2rem - 12px)",
  backgroundColor: "$secondary",
  borderRadius: "100%",
  boxShadow: `2px 2px 5px #0001`,
  transition: "$all",
  transform: "translateX(6px)",
  willChange: "transform",

  span: {
    fontFamily: "monospace",
    fontSize: "0.8333rem",
    fontWeight: "700",
    display: "flex",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "$primary",
    opacity: "0.382",
    userSelect: "none",
    pointerEvents: "none",
  },

  '&[data-state="checked"]': {
    transform: "translateX(calc(1.236rem + 6px))",

    span: {
      opacity: "1",
      color: "$accent",
    },
  },
});

const Label = styled("label", {
  fontSize: "0.8333rem",
  fontWeight: "400",
  lineHeight: "1em",
  userSelect: "none",
  cursor: "pointer",
  paddingRight: "0.618rem",
});

const StyledToggle = styled("form", {
  display: "flex",
  flexShrink: "0",
  flexGrow: "1",
  alignItems: "center",
  marginLeft: "1.618rem",
});

export { Label, StyledSwitch, StyledThumb, StyledToggle };
