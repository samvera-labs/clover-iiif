import { CSS, styled } from "src/styles/stitches.config";

const annotationItemRow: CSS = {
  position: "relative",
  cursor: "pointer",
  display: "flex",
  width: "100%",
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

const StyledAnnotationContent = styled("div", {
  display: "flex",
  gap: "1rem",
  flexDirection: "column",
  fontSize: "1rem",
  lineHeight: "1.47em",
  margin: "0",
});

const Item = styled("div", {
  ...annotationItemRow,

  [`&[dir=rtl] ${StyledAnnotationContent}`]: {
    textAlign: "right !important",
  },
});

export {
  annotationItemRow,
  ButtonStyled,
  Group,
  Item,
  StyledAnnotationContent,
};
