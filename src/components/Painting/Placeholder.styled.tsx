import { styled } from "@/stitches";

const PlaceholderStyled = styled("button", {
  background: "none",
  border: "none",
  cursor: "zoom-in",
  width: "100%",
  height: "100%",
  margin: "0",
  padding: "0",
  display: "flex",
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
