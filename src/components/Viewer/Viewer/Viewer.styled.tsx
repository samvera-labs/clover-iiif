import { ExitFullscreenStyled } from "src/components/Shared/Fullscreen/ExitFullscreen";
import { Navigator } from "src/components/Image/Image.styled";
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
   */
  paddingTop: "$4",
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

  /*
   * Full screen.
   *
   * This is Clover's own root, so everything it draws is still here — header, image
   * controls, thumbnail rail, information panel. Nothing is portalled and nothing is hidden;
   * the layout simply has a whole screen to use instead of a slot in a page.
   *
   * What changes is the proportion: the painting takes the height left over rather than the
   * configured `canvasHeight`, and the rail spans the full width along the bottom instead of
   * floating in a corner.
   */
  /*
   * Keyed to the attribute rather than the `:fullscreen` pseudo-class. The attribute is set
   * from the browser's own `fullscreenchange`, so it is just as accurate and it can be
   * asserted on — `:fullscreen` cannot be forced, which leaves a layout keyed to it
   * verifiable only by eye.
   */

  "&[data-fullscreen='true']": {
    // A positioning context for the absolutely positioned exit control.
    position: "relative",
    width: "100vw",
    height: "100vh",
    maxHeight: "100vh",
    backgroundColor: "$secondary",

    /*
     * Direct child only.
     *
     * A descendant selector here also matched the exit control belonging to a nested `Image`,
     * so a full-screen `Viewer` showed two of them. Each host reveals its own and no one
     * else's.
     */
    [`& > ${ExitFullscreenStyled}`]: {
      display: "flex",
    },

    /*
     * The header goes.
     *
     * Its title, IIIF badge and download live one click away in the information panel, and
     * full screen is the one place the image should get the room instead. The panel toggle is
     * not in the header — it sits over the painting — so it survives this.
     */
    ".clover-viewer-header": {
      display: "none",
    },

    /*
     * Room above the information panel's tabs.
     *
     * With the header hidden the panel starts at the very top of the screen, and its tab row
     * sat flush against the edge. This is the space the header used to provide.
     */
    ".clover-viewer-information-panel": {
      paddingTop: "$4",
    },

    /*
     * The navigator drops below the exit control.
     *
     * Both want the top-left corner: the minimap sits at `1rem` and the exit control is
     * `2.5rem` tall from `1rem`, so left alone the button lands on top of the minimap.
     */
    [`& ${Navigator}`]: {
      top: "4.5rem",
    },

    ".clover-viewer-painting": {
      display: "flex",
      flexDirection: "column",
      flexGrow: "1",
      minHeight: "0",
    },

    /*
     * `!important` because `canvasHeight` is applied as an inline style on the painting's
     * canvas, and an inline declaration outranks any rule here. Full screen should fill what
     * is left after the header and the rail, whatever height was configured for the embedded
     * case.
     */
    ".clover-viewer-painting > div": {
      height: "auto !important",
      flexGrow: "1",
      minHeight: "0",
    },

    /*
     * The rail: a full-width band across the bottom.
     *
     * `Content.tsx` moves it out of `Main` for full screen, so by the time these rules apply
     * it is a sibling of the painting-and-panel row rather than sitting inside one column of
     * it. That is what lets `100%` mean the whole screen.
     */
    [`& ${MediaWrapper}`]: {
      flexShrink: "0",
      width: "100%",
      paddingTop: "$3",
    },
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
