import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

import CloverImage from "src/components/Image";
import React from "react";
import { StyledImageViewer } from "src/components/Scroll/Figure/ImageViewer.styled";

interface ImageViewerProps {
  body: IIIFExternalWebResource;
  label?: InternationalString | null;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ body, label }) => {
  return (
    <StyledImageViewer data-testid="scroll-figure-image">
      <CloverImage
        body={body}
        openSeadragonConfig={{ showNavigator: false, showHomeControl: false }}
        {...(label && { label: label })}
      />
    </StyledImageViewer>
  );
};

export default ImageViewer;
