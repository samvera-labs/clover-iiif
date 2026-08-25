import { Label, Summary } from "src/components/Primitives";

import { styled } from "src/styles/stitches.config";

const Width = styled("div", {
  position: "absolute",
  width: "100%",
  backgroundColor: "green",
});

/**
 * The card, and where a slide's width now comes from.
 *
 * Slides used to be a fraction of the viewport — `slidesPerView` divided the track into
 * equal columns — so the figure needed no width of its own. Now the track is the sum of
 * its items, which means each card has to declare its own size. This mirrors the Viewer's
 * canvas thumbnail, which has always carried an explicit `figure` width.
 *
 * Exposed as a custom property rather than a prop: restyling is CSS in this library, so a
 * consumer sets `--clover-slider-item-width` on any ancestor and every card follows.
 */
const FigureStyled = styled("figure", {
  display: "flex",
  flexDirection: "column",
  margin: "0 0 $2",
  flexGrow: "0",
  flexShrink: "0",
  /*
   * Falls back through the shared thumbnail width before its own default, so one variable
   * can scale every thumbnail in the library while the Slider keeps a knob of its own for
   * when only the cards should change. The 1:1 ratio comes from `AspectRatio.Root` in
   * Figure.tsx, which is the same rule the Viewer's rail follows.
   */
  width:
    "var(--clover-slider-item-width, var(--clover-thumbnail-width, 15rem))",
  maxWidth: "100%",
  borderRadius: "3px",
  transition: "$all",

  img: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    objectFit: "cover",
    zIndex: "0",
    width: "100%",
    height: "100%",
    color: "transparent",
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

const Placeholder = styled("span", {
  display: "flex",
  position: "relative",
  width: "100%",
  height: "100%",
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

export { FigureStyled, Placeholder, Title, Description, Width };
