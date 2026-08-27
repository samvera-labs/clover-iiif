import * as RadioGroup from "@radix-ui/react-radio-group";

import { Tag } from "src/components/UI";
import { styled } from "src/styles/stitches.config";

const Outline = styled("span", {
  background: "transparent",
  opacity: "0",
  border: "3px solid transparent",
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: "0",
  left: "0",
  top: "0",
  transition: "$all",
});

const Type = styled("span", {
  display: "flex",
});

const Spacer = styled("span", {
  display: "flex",
  width: "1.2111rem",
  height: "0.7222rem",
});

const Duration = styled("span", {
  display: "inline-flex",
  marginLeft: "5px",
  marginBottom: "-1px",
});

/**
 * The thumbnail box.
 *
 * Square by default, derived from the width — `aspect-ratio` does that, so nothing here
 * needs to know a pixel height. Setting `--clover-thumbnail-height` gives the box a
 * definite height, which wins over the ratio and restores a letterboxed tile:
 *
 *     .my-app { --clover-thumbnail-height: 100px; }
 *
 * The image inside is `object-fit: cover`, so the box crops rather than distorts whatever
 * aspect the canvas actually has.
 */
const FigureImage = styled("div", {
  position: "relative",
  display: "flex",
  backgroundColor: "$secondaryAlt",
  width: "100%",
  aspectRatio: "1",
  height: "var(--clover-thumbnail-height, auto)",
  overflow: "hidden",
  borderRadius: "3px",

  ".media-thumbnail-lazyload": {
    width: "100%",
    height: "100%",
    borderRadius: "3px",
  },

  /*
   * Hidden until the image has loaded, then faded in. Coming on screen is not the same
   * moment as the thumbnail arriving, and without this a tile snaps from placeholder to
   * photograph.
   *
   * Two transitions: `$all` still carries the hover transform and filter, and `$load`
   * follows it to give opacity its own shorter curve — a later entry for the same property
   * wins, so the fade stays snappy while everything else keeps its timing.
   */
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top center",
    filter: "blur(0)",
    transform: "scale3d(1, 1, 1)",
    borderRadius: "3px",
    transition: "$all, $load",
    color: "transparent",
    opacity: "0",
  },

  "&[data-loaded='true'] img": {
    opacity: "1",
  },

  [`& ${Type}`]: {
    position: "absolute",
    right: "0",
    top: "0",

    [`& ${Tag}`]: {
      display: "none",
      margin: "0",
      paddingLeft: "0",
      fontSize: "0.7222rem",
      /*
       * A secondary badge carrying a primary glyph, matching the control buttons.
       *
       * Both halves are tokens on purpose. This was a hardcoded near-black `#000d` behind a
       * `$secondary` glyph, and since only the glyph flipped with the theme, a dark theme put
       * a near-black icon on a near-black badge and it disappeared. A token pair is opposite
       * by definition, so it holds whichever way the theme goes.
       */
      backgroundColor: "$secondary",
      color: "$primary",
      fill: "$primary",
      /*
       * The top right matches the thumbnail's own 3px corner rather than being squared off.
       * The badge only ever shows on the last item of a group, which is the one whose
       * right-hand corners are rounded, and it sits flush in that corner — so its curve has
       * to be the same one. `FigureImage` clips with `overflow: hidden` either way, but
       * agreeing with the clip avoids a hairline of square corner fighting the curve.
       */
      borderTopRightRadius: "3px",

      // Stated on the glyph rather than left to inherit the `fill` above.
      svg: {
        fill: "$primary",
      },
    },
  },
});

const Item = styled(RadioGroup.Item, {
  display: "flex",
  flexShrink: "0",
  padding: "0",
  cursor: "pointer",
  background: "none",
  border: "none",
  fontFamily: "inherit",
  lineHeight: "1.25em",
  fontSize: "1rem",
  textAlign: "left",

  figure: {
    margin: "0",
    width: "var(--clover-thumbnail-width, 161.8px)",

    figcaption: {
      marginTop: "0.5rem",
      fontWeight: "400",
      fontSize: "0.8333rem",
      display: "-webkit-box",
      overflow: "hidden",
      MozBoxOrient: "vertical",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: "5",

      "@sm": {
        fontSize: "0.8333rem",
      },
    },
  },
});

export { Duration, FigureImage, Item, Outline, Spacer, Type };
