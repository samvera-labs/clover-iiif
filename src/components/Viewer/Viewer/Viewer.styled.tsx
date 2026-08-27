import { styled } from "src/styles/stitches.config";
import { themeVarBridge } from "src/styles/tokens";

const MediaWrapper = styled("div", {
  position: "relative",
  zIndex: "0",
  /*
   * Breathing room between the painting above and the rail's controls.
   *
   * It belongs here, on the Viewer's own wrapper, rather than in the Slider. What sits above
   * the rail is the Viewer's business — a deep-zoom canvas, a video, an audio player — and
   * the Slider has no idea it is underneath any of them. Standing alone it should still sit
   * flush with whatever a consumer puts around it.
   *
   * Matched to the gap the header already leaves beneath itself, so the rhythm above and
   * below the controls is even. The full-page rule below re-declares `padding` outright and
   * wins on specificity, which is what that floating panel wants.
   */
  paddingTop: "$4",

  /*
   * Floating over OpenSeadragon's full-page view, bottom left.
   *
   * `position: fixed` against the viewport rather than absolute, because at this point
   * the strip is a direct child of `<body>` — see the portal in Content.tsx. The z-index
   * clears OpenSeadragon's own furniture: its controls sit at 100 and its full-page
   * element is appended to body alongside this, so this has to win on both counts.
   *
   * Width is capped so a long sequence does not span the whole screen, and the strip
   * scrolls within itself instead.
   */
  "&[data-fullpage='true']": {
    /*
     * The token bridge has to be re-declared here.
     *
     * `themeVarBridge` maps `--colors-*` onto `--clover-color-*`, and it is declared on
     * each component's own wrapper. In full page this strip is portalled to `<body>`,
     * outside that subtree — so every `$token` below would resolve against nothing and
     * fall back to whatever `--clover-color-*` happened to sit on `:root`, or to
     * transparent for a consumer who sets none. Carrying the bridge makes the strip
     * self-sufficient wherever it is re-homed.
     */
    ...themeVarBridge,
    position: "fixed",
    zIndex: "200",
    bottom: "1rem",
    left: "1rem",
    width: "auto",
    maxWidth: "min(38rem, calc(100vw - 2rem))",
    padding: "0.5rem",
    borderRadius: "5px",
    /*
     * `$secondary` is the surface token — `$primary` is Clover's foreground (it defaults
     * to #1A1D1E and a dark theme flips it light), so using it here painted the panel in
     * the text colour and inverted with the theme.
     *
     * Solid rather than translucent: the strip sits over arbitrary imagery, and a wash
     * lets the picture bleed through the thumbnails it is meant to distinguish.
     *
     * The border does what the drop shadow used to. In full page this floats over the
     * artwork itself, so it needs some boundary of its own; a hairline is the flat way to
     * draw one.
     */
    backgroundColor: "$secondary",
    border: "1px solid #6663",

    "@sm": {
      maxWidth: "calc(100vw - 1rem)",
      bottom: "0.5rem",
      left: "0.5rem",
    },
  },
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

  // Inverted with the rest of the control buttons: a secondary surface carrying a primary
  // glyph, filling with the accent on interaction. It sits directly beside the image
  // controls, so leaving it dark would have singled it out.
  background: "$secondary",
  border: "none",
  borderRadius: "50%",

  cursor: "pointer",
  color: "$primary",
  fontSize: "0.75rem",
  lineHeight: "1",

  svg: {
    width: "1.25rem",
    height: "1.25rem",
  },

  "&:hover, &:focus-visible": {
    background: "$accent",
    color: "$secondary",
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
  ...themeVarBridge,
  display: "flex",
  flexDirection: "column",
  // Inherited, not tokenised. Clover takes its type from whatever contains it.
  fontFamily: "inherit",
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
