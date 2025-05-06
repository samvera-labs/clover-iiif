import { CSS, styled } from "src/styles/stitches.config";

const annotationItemRow: CSS = {
  position: "relative",
  display: "flex",
  margin: "0 1.618rem",
  padding: "0.5rem 0",
  fontFamily: "inherit",
  fontSize: "0.8333rem",
  lineHeight: "1.47rem",
  color: "inherit",
  background: "none",
  borderRadius: "3px",
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

  header: {
    margin: "0 1.618rem 0.5rem ",
    fontWeight: 700,
    fontSize: "0.8333rem",
  },
  paddingBottom: "1rem",
  marginBottom: "1rem",
  borderBottom: "1px solid #0001",
});

const StyledAnnotationContent = styled("div", {
  gap: "1rem",
  fontSize: "1rem",
  lineHeight: "1.47em",
  margin: "0",

  "&[data-content-search=true]": {
    em: {
      fontWeight: 700,
      display: "inline",
    },
  },
});

const Item = styled("div", {
  ...annotationItemRow,
  display: "flex",
  flexDirection: "row",
  gap: "1rem",

  "&[data-format='text/vtt']": {
    marginTop: "-1rem",

    "> span": {
      display: "none",
    },
  },

  "> span": {
    display: "flex",
    width: "2rem",
    height: "2rem",
    backgroundColor: "#0001",
    flexShrink: "0",
    borderRadius: "3px",
    marginTop: "0.25rem",
  },

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
