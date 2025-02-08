import { styled } from "src/styles/stitches.config";

const StructureContent = styled("div", {
  padding: " 0 1.618rem 2rem",
  display: "flex",
  flexDirection: "column",
  overflow: "scroll",
  position: "absolute",
  fontWeight: "400",
  fontSize: "1rem",
  zIndex: "0",

  ".manifest-property-title": {
    fontWeight: "700",
    margin: "1rem 0 0.25rem",
  },

  "a": {
    color: "Blue",
    textDecoration: "underline",
  },

  "ul, ol": {
    padding: "0",
    marginLeft: "1rem",
    listStyleType: "disc",

    li: {
      fontSize: "1rem",
      lineHeight: "1.45em",
      margin: "0.25rem 0 0.25rem",
    },
  },
});

const StructureStyled = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  zIndex: "0",
});

export { StructureContent, StructureStyled };