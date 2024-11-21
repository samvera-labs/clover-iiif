import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

import { Thumbnail as CloverPrimitivesThumbnail } from "src/components/Primitives";
import React from "react";
import { StyledImageViewer } from "src/components/Scroll/Figure/ImageViewer.styled";

interface FigureThumbnailProps {
  body: IIIFExternalWebResource;
  label?: InternationalString | null;
}

const FigureThumbnail: React.FC<FigureThumbnailProps> = ({ body, label }) => {
  return (
    <StyledImageViewer data-testid="scroll-figure-thumbnail">
      <CloverPrimitivesThumbnail
        thumbnail={[body]}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
        altAsLabel={label as InternationalString}
      />
    </StyledImageViewer>
  );
};

export default React.memo(FigureThumbnail);
