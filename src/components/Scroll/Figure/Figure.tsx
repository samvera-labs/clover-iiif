import React, { useContext } from "react";
import { ScrollContext, initialState } from "src/context/scroll-context";
import {
  StyledFigure,
  StyledFigurePlaceholder,
} from "src/components/Scroll/Figure/Figure.styled";

import { CanvasNormalized } from "@iiif/presentation-3";
import FigureCaption from "src/components/Scroll/Figure/Caption";
import FigureImageViewer from "src/components/Scroll/Figure/ImageViewer";
import FigureThumbnail from "./Thumbnail";
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
  const { vault, options } = state;
  const { figure } = options;

  const display = figure.display
    ? figure.display
    : initialState.options.figure.display;
  const aspectRatio = figure.aspectRatio
    ? figure.aspectRatio
    : initialState.options.figure.aspectRatio;

  const painting = getPaintingResource(vault, canvas.id);

  if (!painting) return null;

  return (
    <StyledFigure>
      {painting?.map((body) => {
        return (
          <StyledFigurePlaceholder ratio={aspectRatio} key={body?.id}>
            {display === "thumbnail" && (
              <FigureThumbnail body={body} label={canvas?.label} />
            )}
            {display === "image-viewer" && (
              <FigureImageViewer label={canvas?.label} body={body} />
            )}
          </StyledFigurePlaceholder>
        );
      })}
      <FigureCaption canvas={canvas} canvasInfo={canvasInfo} />
    </StyledFigure>
  );
};

export default ScrollCanvasFigure;
