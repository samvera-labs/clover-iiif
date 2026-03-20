import { globalStyle, style } from "@vanilla-extract/css";
import { mediaQueries, vars } from "src/styles/theme.css";

export const thumbnailOutline = style({
  background: "transparent",
  opacity: 0,
  border: "3px solid transparent",
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: 0,
  left: 0,
  top: 0,
  transition: vars.transitions.all,
});

export const thumbnailType = style({
  display: "flex",
  position: "absolute",
  right: 0,
  bottom: 0,
});

globalStyle(`.${thumbnailType} [data-ui-tag='true']`, {
  display: "none",
  margin: 0,
  paddingLeft: 0,
  fontSize: "0.7222rem",
  backgroundColor: "#000d",
  color: vars.colors.background,
  fill: vars.colors.background,
  borderBottomLeftRadius: 0,
  borderTopRightRadius: 0,
});

export const thumbnailSpacer = style({
  display: "flex",
  width: "1.2111rem",
  height: "0.7222rem",
});

export const thumbnailDuration = style({
  display: "inline-flex",
  marginLeft: vars.space[2],
  marginBottom: "-1px",
});

export const thumbnailFigureImage = style({
  position: "relative",
  display: "flex",
  backgroundColor: vars.colors.backgroundAlt,
  width: "inherit",
  height: "100px",
  overflow: "hidden",
  borderRadius: vars.radii.sm,
});

globalStyle(`.${thumbnailFigureImage} .media-thumbnail-lazyload`, {
  width: "100%",
  height: "100%",
  borderRadius: vars.radii.sm,
});

globalStyle(`.${thumbnailFigureImage} img`, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "top center",
  color: "transparent",
  borderRadius: vars.radii.sm,
  transition: vars.transitions.all,
});

export const thumbnailItem = style({
  display: "flex",
  flexShrink: 0,
  padding: 0,
  cursor: "pointer",
  background: "none",
  border: "none",
  fontFamily: "inherit",
  lineHeight: "1.25em",
  fontSize: "1rem",
  textAlign: "left",
});

globalStyle(`.${thumbnailItem} figure`, {
  margin: 0,
  width: "161.8px",
});

globalStyle(`.${thumbnailItem} figcaption`, {
  marginTop: vars.space[2],
  fontWeight: 400,
  fontSize: "0.8333rem",
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: "5",
  "@media": {
    [mediaQueries.sm]: {
      fontSize: vars.fontSizes[3],
    },
  },
});
