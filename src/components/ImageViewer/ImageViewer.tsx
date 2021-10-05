import React from "react";
import { IIIFExternalWebResource } from "@hyperion-framework/types";
import { styled } from "@stitches/react";

const ImageViewer: React.FC<IIIFExternalWebResource> = ({
  id,
  format,
  height,
  type,
  width,
}) => {
  return (
    <ImageContainer data-testid="image-container">
      <Image
        src={id}
        alt="Yo gimme something to describe"
        style={{ maxHeight: "100%" }}
      />
    </ImageContainer>
  );
};

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

export default ImageViewer;
