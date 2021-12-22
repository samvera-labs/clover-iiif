import { styled } from "stitches";
import { Popover } from "@nulib/design-system";

const IIIFBadgeButton = styled(Popover.Trigger, {
  width: "30px",
  padding: "5px",
});

const IIIFBadgeContent = styled(Popover.Content, {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.8333rem",

  button: {
    display: "flex",
    textDecoration: "none",
    fontFamily: "$sans",
    marginBottom: "0.5em",
    color: "$accentAlt",
    cursor: "pointer",
    background: "$secondary",
    border: "none",

    ["&:last-child"]: {
      marginBottom: "0",
    },
  },
});

const Header = styled("header", {
  display: "flex",
  backgroundColor: "transparent !important",
  justifyContent: "space-between",
  padding: "0 0 0.5rem",

  span: {
    fontSize: "1.25rem",
    fontWeight: "700",
    fontFamily: "$display",

    "@sm": {
      padding: "1rem",
      fontSize: "1rem",
    },
  },
});

export { Header, IIIFBadgeButton, IIIFBadgeContent };
