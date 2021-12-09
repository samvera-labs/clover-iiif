import * as Tabs from "@radix-ui/react-tabs";
import { styled } from "stitches";

const Wrapper = styled(Tabs.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  boxShadow: "-5px -5px 5px #00000011",

  "@sm": {
    marginTop: "0.5rem",
    boxShadow: "none",
  },

  "&:after": {
    position: "absolute",
    bottom: 0,
    content: "",
    width: "100%",
    height: "1rem",
    backgroundImage: `linear-gradient(0deg, #FFFFFF 0%, #FFFFFF00 100%)`,
    zIndex: 1,

    "@sm": {
      backgroundImage: "none",
    },
  },
});

const List = styled(Tabs.List, {
  display: "flex",
  flexGrow: "0",
  margin: "0 1.618rem",
  borderBottom: "4px solid $secondaryAlt",
  backgroundColor: "$secondary",

  "@sm": {
    margin: "0 1rem",
  },
});

const Trigger = styled(Tabs.Trigger, {
  display: "flex",
  position: "relative",
  padding: "0.5rem 1rem",
  background: "none",
  backgroundColor: "transparent",
  color: "$primaryMuted",
  border: "none",
  fontFamily: "inherit",
  fontSize: "1rem",
  marginRight: "1rem",
  lineHeight: "1rem",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontWeight: 700,
  transition: "$all",

  "&::after": {
    width: "0",
    height: "4px",
    content: "",
    backgroundColor: "$primaryMuted",
    position: "absolute",
    bottom: "-4px",
    left: "0",
    transition: "$all",
  },

  "&:hover": {
    color: "$primary",
  },

  "&[data-state='active']": {
    color: "$accent",

    "&::after": {
      width: "100%",
      backgroundColor: "$accent",
    },
  },
});

const Content = styled(Tabs.Content, {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  position: "absolute",
  top: "0",
  left: "0",

  "&[data-state='active']": {
    width: "100%",
    height: "calc(100% - 2rem)",
    padding: "1rem 0",
  },
});

const Scroll = styled("div", {
  position: "relative",
  height: "100%",
  width: "100%",
  overflowY: "scroll",
});

export { Content, List, Scroll, Trigger, Wrapper };
