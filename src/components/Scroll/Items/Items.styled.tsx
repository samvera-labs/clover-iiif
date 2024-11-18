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
  width: "38.2%",
});

const StyledItemTextualBodies = styled("div", {
  width: "61.8%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",

  "> div": {
    display: "flex",
    flexDirection: "row",
    gap: "2.618rem",

    "> div": {
      width: "calc(100% / var(--num-items))",
      boxSizing: "border-box",
    },
  },
});

const PageBreak = styled("hr", {
  margin: "0",
  borderColor: "transparent",
  height: "1.618rem",
  position: "relative",
  width: "61.8%",
  zIndex: 0,
  marginLeft: "38.2%",
  display: "flex",
  justifyContent: "flex-end",

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
    width: "calc(100% -  2.618em)",
    position: "absolute",
    zIndex: 0,
    height: "1px",
    background: "#6662",
  },
});

const StyledScrollItems = styled("div", {
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
