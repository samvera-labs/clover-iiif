import * as Tabs from "@radix-ui/react-tabs";

import React, { ReactNode } from "react";

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
  maskImage: `linear-gradient(180deg, rgba(0, 0, 0, 1) calc(100% -  2rem), transparent 100%)`,

  "@sm": {
    marginTop: "0.5rem",
    boxShadow: "none",
  },
});

const List = styled(Tabs.List, {
  display: "flex",
  flexGrow: "0",
  margin: "0 1.618rem",
  borderBottom: "5px solid #6663",

  "@sm": {
    margin: "0 1rem",
  },
});

const Trigger = styled(Tabs.Trigger, {
  display: "flex",
  position: "relative",
  padding: "0.5rem 1.618rem",
  background: "none",
  backgroundColor: "transparent",
  fontFamily: "inherit",
  border: "none",
  opacity: "0.7",
  fontSize: "1rem",
  lineHeight: "1rem",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontWeight: 400,
  transition: "$all",

  "&[data-value='manifest-back']": {
    display: "none;",

    "@sm": {
      display: "block",
    },
  },

  "&::after": {
    width: "0",
    height: "4px",
    content: "",
    position: "absolute",
    bottom: "-4px",
    left: "0",
    transition: "$all",
  },

  "&[data-state='active']": {
    opacity: "1",
    fontWeight: 700,

    "&::after": {
      width: "100%",
      backgroundColor: "$accent",
    },
  },
});

const Content = styled(Tabs.Content, {
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "0",
  position: "absolute",
  top: "0",
  left: "0",

  "&[data-state='active']": {
    width: "100%",
    height: "calc(100% - 2rem)",
    padding: "1.618rem 0",
  },
});

interface Scrollable {
  handleScroll?: (e) => void;
  children?: ReactNode;
  className?: string;
}

const ScrollableComponent: React.FC<Scrollable> = ({
  handleScroll,
  children,
  className,
}) => (
  <div className={className} onScroll={handleScroll}>
    {children}
  </div>
);

const Scroll = styled(ScrollableComponent, {
  position: "relative",
  height: "100%",
  width: "100%",
  overflowY: "scroll",
});

export { Content, List, Scroll, Trigger, Wrapper };
