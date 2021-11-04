import React from "react";
import { IIIFExternalWebResource } from "@hyperion-framework/types";
import { ImageContainer, Image } from "./ImageViewer.styled";

const ImageViewer: React.FC<IIIFExternalWebResource> = ({ id }) => {
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

export default ImageViewer;
