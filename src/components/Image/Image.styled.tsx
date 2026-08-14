import { styled } from "src/styles/stitches.config";
import { themeVarBridge } from "src/styles/tokens";

const Navigator = styled("div", {
  position: "absolute !important",
  zIndex: "1",
  top: "1rem",
  left: "1rem",
  width: "161.8px",
  height: "100px",
  backgroundColor: "#000D",
  boxShadow: "5px 5px 5px #0002",
  borderRadius: "3px",

  ".displayregion": {
    border: " 3px solid $accent !important",
    boxShadow: "0 0 3px #0006",
  },

  "@sm": {
    width: "123px",
    height: "76px",
  },

  "@xs": {
    width: "100px",
    height: "61.8px",
  },
});

const Viewport = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",

  /*
   * OSD gives its canvas tabindex="0" but no visible focus state of its own, so the
   * keyboard ring is ours to draw.
   *
   * Drawn as a pseudo-element stacked above the canvas rather than as an `outline`. The
   * canvas holds the drawer surface that paints the image, and an outline on the parent
   * can end up beneath it; a positioned `::after` with a z-index sits over the artwork
   * unambiguously. `inset: 0` needs no negative offset — OSD sets `overflow: hidden` on
   * the canvas, so the ring is clipped to it either way.
   *
   * Two tones, not one: this sits on top of arbitrary photography, and a single accent
   * stroke disappears against an image that happens to be the same tone. The accent
   * takes the outer 3px, the secondary colour the next 3px.
   *
   * A side benefit of dropping `outline`: OSD injects
   * `@media (hover: none) { .openseadragon-canvas:focus { outline: none !important } }`
   * to suppress a ring when a touch user taps the canvas. That rule used to silence the
   * keyboard ring on a tablet with a keyboard attached, and needed an `!important`
   * counter-rule. It cannot touch a box-shadow, so the counter-rule is gone.
   */
  ".openseadragon-canvas:focus-visible::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    // Above the drawer canvas and the overlay container, both of which are z-index auto.
    zIndex: 1,
    // The ring is decoration; never let it intercept a drag, click or wheel.
    pointerEvents: "none",
    /*
     * The halo is a literal white, not `$secondary`.
     *
     * This pair is the ring's contrast: WCAG 1.4.11 asks a state indicator for 3:1
     * against its adjacent colours, and the accent's neighbour is the halo. `$secondary`
     * cannot play that part, because a dark theme inverts it to near-black — and against
     * a near-black halo the darker accents never reach 3:1 at any opacity (Northwestern
     * measures 1.79:1, Tulane 2.72:1, Harvard 2.52:1, even fully opaque). Pinned to
     * white the pair holds 4.59:1 (Texas, the lightest preset) through 10.56:1
     * (Northwestern), in both themes.
     *
     * `$colors$accent`, not `$accent`: Stitches resolves a bare token against the scale
     * it infers from the property, and for `boxShadow` that is `shadows` — which this
     * config does not define, so the declaration silently computes to `none`.
     */
    boxShadow: "inset 0 0 0 3px $colors$accent, inset 0 0 0 6px #fff",
    /*
     * Faded to the 3:1 floor rather than to taste.
     *
     * Opacity here is not free: both rings composite toward whatever is beneath them, so
     * the contrast *between* them decays as it drops — which is why an earlier 30% could
     * not have met 3:1 over any backdrop. 0.75 is the lowest value where every preset
     * accent still clears 3:1 against the halo over black, grey and white alike; Texas
     * burnt orange sets the floor at 74%.
     *
     * Kept on the pseudo-element rather than baked into the two colours so the pair
     * fades together and the relationship survives an accent change.
     */
    opacity: 0.75,
  },

  /*
   * Forced-colors modes (Windows High Contrast) discard box-shadow, which would leave
   * the canvas with no focus indicator at all. A real outline is honoured there.
   *
   * Deliberately left fully opaque: the fade above is tuned against Clover's own halo,
   * and forced-colors substitutes the user's palette for both, so the ratio no longer
   * holds. `CanvasText` on `Canvas` is guaranteed legible by the mode itself.
   */
  "@media (forced-colors: active)": {
    ".openseadragon-canvas:focus-visible": {
      outline: "3px solid CanvasText",
      outlineOffset: "-3px",
    },
  },

  ".clover-iiif-image-openseadragon-annotation": {
    position: "relative",
    backgroundColor: "transparent",
    border: "2px solid #0003",
    boxSizing: "content-box",
    borderRadius: "3px",
    boxShadow: "0 0 38vw 38vw transparent",
    zIndex: "0",

    label: {
      opacity: 0,
      position: "absolute",
      lineHeight: "1.47rem",
      pointerEvents: "none",
      textAlign: "center",
      minWidth: "300px",
      maxWidth: "20vw",
      padding: "0.5rem",
      borderRadius: "3px",
      top: "calc(100% + 0.5rem)",
      left: "50%",
      transform: "translate(-50%, 0)",
      backgroundColor: "$primary",
      color: "$secondary",
      transition: "opacity 100ms ease-in-out",
    },

    "&[data-active=true]": {
      border: "1px solid #fff2 !important",
      outline: "2px solid $accent !important",
      outlineOffset: "0px !important",
      boxShadow: "0 0 38vw 38vw #0003",
      zIndex: "99999999",

      label: {
        opacity: 1,
      },
    },
  },
});

const Wrapper = styled("div", {
  ...themeVarBridge,
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
  background: "transparent",
  backgroundSize: "contain",
  color: "white",
  position: "relative",
  zIndex: "0",
  overflow: "hidden",

  variants: {
    hasNavigator: {
      true: {
        [`${Navigator}`]: {
          display: "block",
        },
      },
      false: {
        [`${Navigator}`]: {
          display: "none",
        },
      },
    },
  },
});

export { Navigator, Viewport, Wrapper };
