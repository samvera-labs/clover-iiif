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
  flexShrink: 0,
});

const StyledItemTextualBodies = styled("div", {
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  justifyContent: "flex-start",

  "> div": {
    display: "flex",
    flexDirection: "row",
    gap: "2.618rem",
    width: "100%",
  },
});

const StyledLanguageColumn = styled("div", {
  width: "calc(100% / var(--num-items, 1))",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minWidth: 0,
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

  "&::after": {
    content: "",
    width: "calc(100% -  2.618em)",
    bottom: "0",
    position: "absolute",
    zIndex: 0,
    height: "2px",
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
  StyledLanguageColumn,
  PageBreak,
};
