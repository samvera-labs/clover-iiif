import { styled } from "src/styles/stitches.config";
import { themeVarBridge } from "src/styles/tokens";

/**
 * The Slider's root element. It carries no layout of its own — the Header and
 * Items own that — but it gives the component the `clover-slider` class hook the
 * other top-level components already have, and it is where Clover's tokens are
 * re-derived so a theme set by an ancestor reaches the slides.
 */
const Wrapper = styled("div", {
  ...themeVarBridge,
  // Inherited, not tokenised. Clover takes its type from whatever contains it.
  fontFamily: "inherit",
});

export { Wrapper };
