import * as Tabs from "@radix-ui/react-tabs";
import { styled } from "src/styles/stitches.config";

const Wrapper = styled(Tabs.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
  maskImage: `linear-gradient(180deg, rgba(0, 0, 0, 1) calc(100% - 2rem), transparent 100%)`,

  "@sm": {
    marginTop: "0.5rem",
    boxShadow: "none",
  },
});

const List = styled(Tabs.List, {
  display: "flex",
  flexGrow: "0",
  margin: "0 1.618rem",
  borderBottom: "4px solid $secondaryAlt",

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
