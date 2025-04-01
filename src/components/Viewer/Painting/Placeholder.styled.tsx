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
  opacity: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    color: "transparent",
    aspectRatio: "auto",
  },

  "&[data-paged=true]": {
    "img:first-child ": {
      objectPosition: "100% 50%",
    },

    "img:last-child": {
      objectPosition: "0 50%",
    },
  },

  "&[data-active=false]": {
    opacity: 0,
    objectPosition: "50% 50%",
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
