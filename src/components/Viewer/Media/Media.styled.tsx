import * as RadioGroup from "@radix-ui/react-radio-group";

import {
  FigureImage as ThumbnailFigureImage,
  Item as ThumbnailItem,
  Outline as ThumbnailOutline,
} from "./Thumbnail.styled";

import { Tag } from "src/components/UI";
import { styled } from "src/styles/stitches.config";

/*
 * The radio group, and no longer the scrolling element.
 *
 * The rail inside it is a `Slider`, which owns the viewport, the track and the scrolling.
 * This stays as the ancestor purely for semantics: Radix resolves `RadioGroup.Item` through
 * context, so each `Thumbnail` still registers however deeply the carousel nests it, and
 * the group keeps its single tab stop and arrow-key navigation.
 *
 * The old `overflowX: "scroll"` and the flex row are gone — two scroll containers nested
 * inside one another would fight over the same gesture. The gap moved with them, since
 * spacing between slides is the carousel's business now.
 */
const StyledSequence = styled(RadioGroup.Root, {
  display: "block",
  flexGrow: "1",
  position: "relative",
  zIndex: "0",
  /*
   * No padding at the top.
   *
   * There used to be `1.618rem` of it, holding the thumbnails clear of a control bar that
   * was absolutely positioned over them. The controls sit in the Slider's header now, so
   * that clearance became dead space stacked underneath the header's own `paddingBottom` —
   * roughly 46px of gap where the standalone Slider has 20. The bottom stays: it keeps the
   * rail off the component's bottom edge.
   */
  padding: "0 0 1.618rem",
});

const StyledSequenceGroup = styled("div", {
  display: "flex",
  flexDirection: "row",

  "&[data-active='true']": {
    [`& ${ThumbnailItem}`]: {
      figcaption: {
        fontWeight: "700",
      },

      [`& ${Tag}`]: {
        backgroundColor: "$accent",
      },

      [`& ${ThumbnailOutline}`]: {
        background: "#0003",
        opacity: "1",
        borderBottom: "3px solid $accent",
      },

      "&:first-of-type": {
        [`& ${ThumbnailOutline}`]: {
          borderRight: "unset",
        },
      },

      "&:last-of-type": {
        [`& ${ThumbnailOutline}`]: {
          borderLeft: "unset",
        },
      },
    },
  },

  [`& ${ThumbnailItem}`]: {
    [`& ${ThumbnailFigureImage}`]: {
      borderRadius: "unset",
    },

    "&:first-of-type": {
      [`& ${ThumbnailFigureImage}`]: {
        borderTopLeftRadius: "3px",
        borderBottomLeftRadius: "3px",
      },
    },

    "&:last-of-type": {
      [`& ${ThumbnailFigureImage}`]: {
        borderTopRightRadius: "3px",
        borderBottomRightRadius: "3px",
      },

      [`& ${Tag}`]: {
        display: "flex",
      },
    },
  },
});

export { StyledSequence, StyledSequenceGroup };
