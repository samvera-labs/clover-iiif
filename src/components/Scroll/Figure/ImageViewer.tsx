import {
  IIIFExternalWebResource,
  InternationalString,
  Reference,
} from "@iiif/presentation-3";

import CloverImage from "src/components/Image";
import { Thumbnail } from "src/components/Primitives";
import React from "react";
import { StyledImageViewer } from "src/components/Scroll/Figure/ImageViewer.styled";

interface ImageViewerProps {
  body: IIIFExternalWebResource;
  thumbnail?: Reference<"ContentResource">[];
  label?: InternationalString | null;
  display: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  body,
  thumbnail,
  label,
  display,
}) => {
  let thumb: IIIFExternalWebResource = body;

  // Use thumbnail if available
  if (thumbnail?.length) {
    thumb = {
      id: thumbnail[0].id,
      type: "Image",
    };
  }

  return (
    <StyledImageViewer data-testid="scroll-figure">
      {display === "thumbnail" ? (
        <Thumbnail
          data-testid="scroll-figure-thumbnail"
          thumbnail={[thumb]}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
          }}
          altAsLabel={label as InternationalString}
        />
      ) : (
        <CloverImage
          data-testid="scroll-figure-image"
          body={body}
          openSeadragonConfig={{ showNavigator: false, showHomeControl: false }}
          {...(label && { label: label })}
        />
      )}
    </StyledImageViewer>
  );
};

export default React.memo(ImageViewer);
