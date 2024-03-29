import React, { useContext } from "react";

import { CanvasNormalized } from "@iiif/presentation-3";
import FigureCaption from "src/components/Scroll/Figure/Caption";
import ImageViewer from "src/components/Scroll/Figure/ImageViewer";
import { ScrollContext } from "src/context/scroll-context";
import { StyledFigure } from "src/components/Scroll/Figure/Figure.styled";
import { getPaintingResource } from "src/hooks/use-iiif";

interface CanvasProps {
  canvas: CanvasNormalized;
  canvasInfo: {
    current: number;
    total: number;
  };
}

const ScrollCanvasFigure: React.FC<CanvasProps> = ({ canvas, canvasInfo }) => {
  const { state } = useContext(ScrollContext);
  const { vault } = state;

  const painting = getPaintingResource(vault, canvas.id);

  if (!painting) return null;

  return (
    <StyledFigure>
      {painting?.map((body) => (
        <ImageViewer body={body} key={body?.id} label={canvas?.label} />
      ))}
      <FigureCaption canvas={canvas} canvasInfo={canvasInfo} />
    </StyledFigure>
  );
};

export default ScrollCanvasFigure;
