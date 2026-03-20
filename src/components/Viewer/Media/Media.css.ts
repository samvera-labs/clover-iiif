import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "src/styles/theme.css";
import {
  thumbnailFigureImage,
  thumbnailItem,
  thumbnailOutline,
} from "./Thumbnail.css";

export const mediaSequence = style({
  display: "flex",
  flexDirection: "row",
  flexGrow: 1,
  overflowX: "scroll",
  position: "relative",
  zIndex: 0,
  gap: "1rem",
  padding: "1.618rem 0",
});

export const mediaSequenceGroup = style({
  display: "flex",
  flexDirection: "row",
});

globalStyle(`.${mediaSequenceGroup}[data-active='true'] .${thumbnailItem} figcaption`, {
  fontWeight: 700,
});

globalStyle(`.${mediaSequenceGroup}[data-active='true'] [data-ui-tag='true']`, {
  backgroundColor: vars.colors.accent,
});

globalStyle(`.${mediaSequenceGroup}[data-active='true'] .${thumbnailOutline}`, {
  background: "#0003",
  opacity: 1,
  borderBottom: `3px solid ${vars.colors.accent}`,
});

globalStyle(`.${mediaSequenceGroup} .${thumbnailItem} .${thumbnailFigureImage}`, {
  borderRadius: 0,
});

globalStyle(
  `.${mediaSequenceGroup} .${thumbnailItem}:first-of-type .${thumbnailFigureImage}`,
  {
    borderTopLeftRadius: vars.radii.sm,
    borderBottomLeftRadius: vars.radii.sm,
  },
);

globalStyle(
  `.${mediaSequenceGroup} .${thumbnailItem}:last-of-type .${thumbnailFigureImage}`,
  {
    borderTopRightRadius: vars.radii.sm,
    borderBottomRightRadius: vars.radii.sm,
  },
);

globalStyle(
  `.${mediaSequenceGroup} .${thumbnailItem}:last-of-type [data-ui-tag='true']`,
  {
    display: "flex",
  },
);
