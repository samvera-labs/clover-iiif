import { Label, Summary } from "src/components/Primitives";

import { CanvasNormalized } from "@iiif/presentation-3";
import React from "react";

interface FigureCaptionProps {
  canvas?: CanvasNormalized;
  canvasInfo: {
    current: number;
    total: number;
  };
}

const FigureCaption: React.FC<FigureCaptionProps> = ({
  canvas,
  canvasInfo: { current, total },
}) => {
  return (
    <figcaption>
      <em>
        {current} / {total}
      </em>
      {canvas?.label && <Label label={canvas?.label} />}
      {canvas?.summary && <Summary summary={canvas?.summary} as="p" />}
    </figcaption>
  );
};

export default FigureCaption;
