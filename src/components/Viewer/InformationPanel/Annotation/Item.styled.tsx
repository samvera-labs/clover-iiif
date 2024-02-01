import { CSS, styled } from "src/styles/stitches.config";

const annotationItemRow: CSS = {
  position: "relative",
  cursor: "pointer",
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  textAlign: "left",
  margin: "0",
  padding: "0.5rem 1.618rem",
  fontFamily: "inherit",
  lineHeight: "1.25em",
  fontSize: "1rem",
  color: "inherit",
  border: "none",
  background: "none",
};

const ButtonStyled = styled("button", {
  textAlign: "left",

  "&:hover": {
    color: "$accent",
  },
});

const Group = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const Item = styled("div", {
  ...annotationItemRow,
});

const ItemHTMLWrapper = styled("div", {
  "&:hover": {
    color: "$accent",
  },
});

export { annotationItemRow, ButtonStyled, Group, Item, ItemHTMLWrapper };
