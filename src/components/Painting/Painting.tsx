import React from "react";
import Player from "@/components/Player/Player";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import {
  CanvasNormalized,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import PaintingPlaceholder from "./Placeholder";
import { PaintingStyled } from "./Painting.styled";
import Toggle from "./Toggle";
import { useViewerState } from "@/context/viewer-context";

interface PaintingProps {
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
  activeCanvas: string;
  isMedia: boolean;
}

const CloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="close-svg-title"
      focusable="false"
      viewBox="0 0 512 512"
      role="img"
    >
      <title id="close-svg-title">close</title>
      <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
    </svg>
  );
};

const ZoomIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="open-svg-title"
      focusable="false"
      viewBox="0 0 512 512"
      role="img"
    >
      <title id="open-svg-title">open</title>
      <path d="m456.69,421.39l-94.09-94.09c22.65-30.16,34.88-66.86,34.84-104.58,0-96.34-78.38-174.72-174.72-174.72S48,126.38,48,222.72s78.38,174.72,174.72,174.72c37.72.04,74.42-12.19,104.58-34.84l94.09,94.09c10.29,9.2,26.1,8.32,35.3-1.98,8.48-9.49,8.48-23.83,0-33.32Zm-233.97-73.87c-68.89-.08-124.72-55.91-124.8-124.8h0c0-68.93,55.87-124.8,124.8-124.8s124.8,55.87,124.8,124.8-55.87,124.8-124.8,124.8Z" />
      <path d="m279.5,197.76h-3.35s-28.47,0-28.47,0v-31.82c-.77-13.79-12.57-24.33-26.36-23.56-12.71.71-22.85,10.86-23.56,23.56v3.35h0v28.47h-31.82c-13.79.77-24.33,12.57-23.56,26.36.71,12.71,10.86,22.85,23.56,23.56h3.35s28.47,0,28.47,0v31.82c.77,13.79,12.57,24.33,26.36,23.56,12.71-.71,22.85-10.86,23.56-23.56v-3.35h0v-28.47h31.82c13.79-.77,24.33-12.57,23.56-26.36-.71-12.71-10.86-22.85-23.56-23.56Z" />
    </svg>
  );
};

const Painting: React.FC<PaintingProps> = ({
  activeCanvas,
  isMedia,
  painting,
  resources,
}) => {
  const [isInteractive, setIsInteractive] = React.useState(false);
  const { configOptions, vault } = useViewerState();
  const normalizedCanvas: CanvasNormalized = vault.get(activeCanvas);

  const placeholderCanvas = normalizedCanvas?.placeholderCanvas?.id;
  const hasPlaceholder = Boolean(placeholderCanvas);
  const showPlaceholder = placeholderCanvas && !isInteractive;

  const handleToggle = () => setIsInteractive(!isInteractive);

  return (
    <PaintingStyled
      css={{
        maxHeight: configOptions.canvasHeight,
        backgroundColor: configOptions.canvasBackgroundColor,
      }}
    >
      {placeholderCanvas && (
        <Toggle
          handleToggle={handleToggle}
          isInteractive={isInteractive}
          isMedia={isMedia}
        />
      )}

      {showPlaceholder && (
        <PaintingPlaceholder
          isMedia={isMedia}
          label={normalizedCanvas?.label}
          placeholderCanvas={placeholderCanvas}
          setIsInteractive={setIsInteractive}
        />
      )}

      {!showPlaceholder && (
        <div>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
              hasPlaceholder={hasPlaceholder}
            />
          ) : (
            painting && (
              <ImageViewer
                body={painting}
                hasPlaceholder={hasPlaceholder}
                key={activeCanvas}
              />
            )
          )}
        </div>
      )}
    </PaintingStyled>
  );
};

export default Painting;
