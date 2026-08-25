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

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top center",
    filter: "blur(0)",
    transform: "scale3d(1, 1, 1)",
    borderRadius: "3px",
    transition: "$all",
    color: "transparent",
  },

  [`& ${Type}`]: {
    position: "absolute",
    right: "0",
    bottom: "0",

    [`& ${Tag}`]: {
      display: "none",
      margin: "0",
      paddingLeft: "0",
      fontSize: "0.7222rem",
      backgroundColor: "#000d",
      color: "$secondary",
      fill: "$secondary",
      borderBottomLeftRadius: "0",
      borderTopRightRadius: "0",
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
