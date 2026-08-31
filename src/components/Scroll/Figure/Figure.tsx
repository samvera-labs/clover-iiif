import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import React, { useContext } from "react";
import { ScrollContext, initialState } from "src/context/scroll-context";

import { CanvasNormalized } from "@iiif/presentation-3";
import FigureCaption from "src/components/Scroll/Figure/Caption";
import FigureImageViewer from "src/components/Scroll/Figure/ImageViewer";
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
  const figureOptions = options.figure || {};

  const display =
    figureOptions.display ||
    initialState.options.figure?.display ||
    "image-viewer";

  const aspectRatio =
    figureOptions.aspectRatio ||
    initialState.options.figure?.aspectRatio ||
    100 / 61.8;

  const painting = getPaintingResource(vault, canvas.id);

  if (!painting) return null;

  return (
    <figure className="clover-scroll-figure">
      {painting?.map((body) => {
        return (
          <AspectRatio ratio={aspectRatio} key={body?.id}>
            <FigureImageViewer
              body={body}
              thumbnail={canvas.thumbnail}
              label={canvas?.label}
              display={display}
            />
          </AspectRatio>
        );
      })}
      <FigureCaption canvas={canvas} canvasInfo={canvasInfo} />
    </figure>
  );
};

export default ScrollCanvasFigure;
