import { styled } from "src/styles/stitches.config";

/**
 * The one carousel control.
 *
 * The standalone Slider's header arrows and the Viewer's media strip had drifted into two
 * implementations of the same button: different DOM (a transparent button wrapping a
 * visible icon div, versus a single button that was itself the pill), different disabled
 * treatments (a literal `#6663` disc versus a transparent one), and different hover
 * shadows. Both now render this.
 *
 * Carries no layout margin on purpose. Spacing belongs to the host — the Slider header
 * spaces its row with a gap, while the media strip packs its arrows either side of a
 * pager.
 */
const ControlStyled = styled("button", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "2rem !important",
  height: "2rem !important",
  padding: "0",
  margin: "0",
  border: "none",
  borderRadius: "2rem",
  fontFamily: "inherit",
  fontWeight: "700",
  boxSizing: "content-box !important",
  cursor: "pointer",
  transition: "$all",

  // Secondary surface carrying a primary glyph, filling with the accent on interaction.
  backgroundColor: "$secondary",
  color: "$primary",

  svg: {
    height: "60%",
    width: "60%",
    padding: "20%",
    fill: "$primary",
    stroke: "$primary",
    opacity: "1",
    boxSizing: "inherit",
    transition: "$all",
  },

  /*
   * Gated to `:enabled`. `:hover` matches disabled elements too, so without the gate a
   * spent arrow still flipped its glyph to `$secondary` — a light mark over the dimmed
   * surface below, which washed out.
   */
  "&:hover:enabled, &:focus-visible:enabled": {
    backgroundColor: "$accent",
    color: "$secondary",

    svg: {
      fill: "$secondary",
      stroke: "$secondary",
    },
  },

  /*
   * The same surface as the enabled state, with the glyph faded back.
   *
   * Dimming with opacity rather than a muted colour handles both icon families at once: the
   * arrows are stroked with `currentColor` while the search and close glyphs are filled, so
   * a colour swap has to be written twice and is easy to write only once — which is how
   * half the set stayed undimmed before.
   */
  "&:disabled": {
    backgroundColor: "$secondary",
    // Nothing to click, so nothing should suggest otherwise.
    cursor: "default",

    svg: {
      opacity: "0.7",
    },
  },
});

export { ControlStyled };
