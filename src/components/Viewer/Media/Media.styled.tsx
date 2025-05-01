import * as RadioGroup from "@radix-ui/react-radio-group";

import {
  FigureImage as ThumbnailFigureImage,
  Item as ThumbnailItem,
  Outline as ThumbnailOutline,
} from "./Thumbnail.styled";

import { Tag } from "src/components/UI";
import { styled } from "src/styles/stitches.config";

const StyledSequence = styled(RadioGroup.Root, {
  display: "flex",
  scrollbarWidth: "thin",
  flexDirection: "row",
  flexGrow: "1",
  overflowX: "scroll",
  position: "relative",
  zIndex: "0",
  gap: "1rem",
  padding: "1.618rem 0",
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
