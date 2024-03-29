import { styled } from "src/styles/stitches.config";

const StyledItem = styled("article", {
  transition: "all 0.382s ease-in-out",
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  gap: "2.618rem",
});

const StyledItemFigure = styled("div", {
  transition: "$all",
  width: "50%",
  opacity: 0,
  transform: "translateX(2.618rem)",
  zIndex: -1,
});

const StyledItemTextualBodies = styled("div", {
  width: "50%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
});

const PageBreak = styled("hr", {
  margin: "0",
  borderColor: "transparent",
  height: "1.618rem",
  position: "relative",
  zIndex: 0,
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "2.618rem",

  "&::before": {
    content: "attr(aria-label)",
    position: "absolute",
    right: "1.618rem",
    bottom: "0",
    zIndex: 1,
    display: "flex",
    fontSize: "0.7222rem",
    fontWeight: "400",
    lineHeight: "1rem",
    background: "inherit",
    opacity: 0.7,
  },

  "&::after": {
    content: "",
    width: "100%",
    position: "absolute",
    zIndex: 0,
    height: "1px",
    background: "#6662",
  },
});

const StyledScrollItems = styled("div", {
  position: "relative",
  zIndex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "2.618rem",

  "&[data-figures-visible='true']": {
    [`& ${StyledItemFigure}`]: {
      opacity: 1,
      zIndex: 0,
      transform: "translateX(0)",
    },
  },
});

export {
  StyledScrollItems,
  StyledItem,
  StyledItemFigure,
  StyledItemTextualBodies,
  PageBreak,
};
