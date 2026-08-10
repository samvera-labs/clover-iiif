import { styled } from "src/styles/stitches.config";

const MediaWrapper = styled("div", {
  position: "relative",
  zIndex: "0",
});

const Content = styled("div", {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  overflow: "hidden",
});

const Main = styled("div", {
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  flexShrink: "1",
  position: "relative",
  width: "100%",
  height: "100%",

  "&[data-aside-active='true']": {
    width: "61.8%",

    "@sm": {
      width: "0",
      opacity: "0",
    },
  },

  "&[data-aside-toggle='false']": {
    "@sm": {
      width: "100% !important",
      opacity: "1 !important",
    },
  },
});

const PanelToggle = styled("button", {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  zIndex: "2",

  "&[data-aside-active='true']": {
    right: "calc(-1rem - 2px)",
  },

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  width: "2rem",
  height: "2rem",
  padding: "0",

  background: "$primary",
  border: "none",
  borderRadius: "50%",
  boxShadow: "2px 2px 5px #0003",

  cursor: "pointer",
  color: "$secondary",
  fontSize: "0.75rem",
  lineHeight: "1",

  svg: {
    width: "1.25rem",
    height: "1.25rem",
  },

  "&:hover, &:focus-visible": {
    background: "$accent",
  },

  "&:focus-visible": {
    outline: "2px solid $secondary",
    outlineOffset: "-2px",
  },
});

const DragHandle = styled("div", {
  flexShrink: "0",
  width: "5px",
  cursor: "col-resize",
  background: "$secondaryAlt",
  opacity: "0.5",
  transition: "background 0.15s",
  zIndex: "1",

  "&:hover, &[data-dragging='true']": {
    background: "$accent",
    opacity: "0.8",
  },

  "@sm": {
    display: "none",
  },
});

const Aside = styled("aside", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  width: "0",
  maxHeight: "100%",

  "&[data-aside-active='true']": {
    width: "38.2%",

    "@sm": {
      width: "100%",
    },
  },

  "&[data-aside-toggle='false']": {
    "@sm": {
      width: "0 !important",
    },
  },
});

const Wrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  fontSmooth: "auto",
  webkitFontSmoothing: "antialiased",

  '&[data-absolute-position="true"]': {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: "0",
  },

  "> div": {
    display: "flex",
    flexDirection: "column",
    flexGrow: "1",
    justifyContent: "flex-start",
    height: "100%",
    maxHeight: "100%",

    "@sm": {
      [`& ${Content}`]: {
        flexGrow: "1",
      },

      [`& ${Main}`]: {
        flexGrow: "0",
      },
    },
  },

  "@sm": {
    padding: "0",
  },

  "&[data-information-panel-open='true']": {
    "@sm": {},
  },
});

/**
 * Positions a replacement panel toggle where the default one sits, so a consumer
 * supplies only the button's appearance. Sizing and styling stay theirs.
 */
const CustomPanelToggle = styled("span", {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  zIndex: "2",
  display: "flex",

  "&[data-aside-active='true']": {
    right: "calc(-1rem - 2px)",
  },
});

export {
  Wrapper,
  Content,
  Main,
  MediaWrapper,
  Aside,
  PanelToggle,
  CustomPanelToggle,
  DragHandle,
};
