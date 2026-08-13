import { styled } from "src/styles/stitches.config";

const ContentsList = styled("ol", {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  margin: "0 1.618rem",
  padding: "0",
  listStyle: "none",

  ol: {
    margin: "0.25rem 0 0 1rem",
  },
});

const ContentsItem = styled("li", {
  display: "flex",
  flexDirection: "column",
});

const ContentsButton = styled("button", {
  display: "flex",
  alignItems: "baseline",
  gap: "0.5rem",
  width: "100%",
  padding: "0.375rem 0",
  border: "none",
  background: "none",
  color: "inherit",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.9375rem",
  lineHeight: "1.47rem",
  textAlign: "left",
  transition: "$all",

  "&:hover, &:focus-visible": {
    color: "$accent",
  },

  '&[aria-current="page"]': {
    color: "$accent",
    fontWeight: 700,
  },
});

const ContentsCanvasPosition = styled("span", {
  display: "inline-flex",
  flexShrink: 0,
  justifyContent: "flex-end",
  minWidth: "1.25rem",
  paddingTop: "0.0625rem",
  color: "$primaryMuted",
  fontSize: "0.6875rem",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  lineHeight: "1rem",
});

export { ContentsButton, ContentsCanvasPosition, ContentsItem, ContentsList };
