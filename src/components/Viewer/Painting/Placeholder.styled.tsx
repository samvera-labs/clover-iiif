import { styled } from "src/styles/stitches.config";

const PlaceholderStyled = styled("button", {
  position: "absolute",
  background: "none",
  border: "none",
  cursor: "zoom-in",
  margin: "0",
  padding: "0",
  width: "100%",
  height: "100%",
  transition: "$all",

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    color: "transparent",
    transition: "$all",
  },

  variants: {
    isMedia: {
      true: {
        cursor: "pointer",
      },
    },
  },
});

export { PlaceholderStyled };
