import { Label, Summary } from "src/components/Primitives";

import { styled } from "src/styles/stitches.config";

/**
 * The card, and where a slide's width comes from.
 *
 * Slides used to be a fraction of the viewport — `slidesPerView` divided the track into
 * equal columns — so the figure needed no width of its own. Now the track is the sum of its
 * items, which means each card has to declare its own size.
 *
 * Sized by the same pair the Viewer's thumbnails use, rather than a knob of its own. A
 * Slider-only `--clover-slider-item-width` existed briefly and was one variable too many:
 * two properties that both set a thumbnail's width, differing only in reach, is a thing to
 * explain rather than a thing to use.
 */
const FigureStyled = styled("figure", {
  display: "flex",
  flexDirection: "column",
  margin: "0 0 $2",
  flexGrow: "0",
  flexShrink: "0",
  /*
   * The default stays `15rem` rather than the rail's `161.8px`: a carousel standing on its
   * own wants a larger card than a navigation strip tucked under a viewer.
   */
  width: "var(--clover-thumbnail-width, 15rem)",
  maxWidth: "100%",
  borderRadius: "3px",
  transition: "$all",

  /*
   * Hidden until the image has actually loaded, then faded in. `LazyLoad` mounting the
   * slide is not the same moment as the thumbnail arriving, and without this the image
   * pops in against the placeholder.
   */
  img: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    objectFit: "cover",
    zIndex: "0",
    width: "100%",
    height: "100%",
    color: "transparent",
    opacity: "0",
    transition: "$load",
  },

  "&[data-loaded='true'] img": {
    opacity: "1",
  },

  video: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    objectFit: "cover",
    zIndex: "1",
    width: "100%",
    height: "100%",
    color: "transparent",
    opacity: "0",
    transition: "$load",
    borderRadius: "3px",
  },

  figcaption: {
    display: "flex",
    flexDirection: "column",
    padding: "$2 0",
    transition: "$all",
  },

  variants: {
    isFocused: {
      true: {
        video: {
          opacity: "1",
        },

        figcaption: {
          color: "$accent",
        },
      },
    },
  },
});

/**
 * The image box, and what makes the card square.
 *
 * This carried no ratio of its own — a Radix `AspectRatio.Root` in Figure.tsx locked it to
 * 1:1, which meant the Slider could not honour `--clover-thumbnail-height` however it was
 * set. The rule is CSS now, stated exactly as the Viewer's rail states it: square by
 * default, and a set height wins.
 */
const Placeholder = styled("span", {
  display: "flex",
  position: "relative",
  width: "100%",
  aspectRatio: "1",
  height: "var(--clover-thumbnail-height, auto)",
  overflow: "hidden",
  borderRadius: "3px",
  boxShadow: "none",
  transition: "$all",
});

const Title = styled(Label, {
  fontSize: "$3",
  fontWeight: "700",
});

const Description = styled(Summary, {
  fontSize: "$2",
  marginTop: "$1",
});

export { FigureStyled, Placeholder, Title, Description };
