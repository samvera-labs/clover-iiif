import { styled } from "src/styles/stitches.config";

/**
 * The Embla viewport.
 *
 * Embla clips this element and translates the inner `.clover-slider-track`, so the
 * overflow is hidden rather than scrollable and the slides sit one level inside. That
 * nesting is also why slide widths can be plain percentages: the track is `width: 100%`,
 * so a percentage resolves to the same box the viewport occupies.
 *
 * `touchAction: "pan-y pinch-zoom"` lets Embla claim horizontal drags while leaving
 * vertical scrolling and pinch-zoom to the page.
 */
const ItemsStyled = styled("div", {
  overflow: "hidden",
  width: "100%",

  "& .clover-slider-track": {
    touchAction: "pan-y pinch-zoom",
  },

  "& .clover-slider-slide": {
    transform: "translate3d(0, 0, 0)",
  },
});

export { ItemsStyled };
