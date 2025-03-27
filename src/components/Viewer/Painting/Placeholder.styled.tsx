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
  display: "flex",

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    color: "transparent",
    transition: "$all",
  },

  "&[data-is-paged=true]": {
    "img:first-child": {
      width: "50%",
      objectPosition: "100% 0",
    },

    "img:last-child ": {
      width: "50%",
      objectPosition: "0 0",
    },
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
