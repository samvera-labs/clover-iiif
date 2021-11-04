import { styled } from "@stitches/react";

const ImageContainer = styled("div", {
  width: "100%",
  height: "300px",
  background: "black",
  backgroundSize: "contain",
  color: "white",
});

const Image = styled("img", {
  maxHeight: "100%",
});

export { ImageContainer, Image };
