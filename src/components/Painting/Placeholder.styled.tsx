import { styled } from "@/stitches";

const PlaceholderStyled = styled("button", {
  background: "none",
  border: "none",
  cursor: "zoom-in",
  width: "100%",
  height: "100%",

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

export { PlaceholderStyled };
