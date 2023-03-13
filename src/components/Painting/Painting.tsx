import React from "react";
import Player from "@/components/Player/Player";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import {
  CanvasNormalized,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import PaintingPlaceholder from "./Placeholder";
import { PaintingStyled, Toggle } from "./Painting.styled";
import { useViewerState } from "@/context/viewer-context";

interface PaintingProps {
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
  activeCanvas: string;
  isMedia: boolean;
}

// const CloseIcon = () => {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
//       <title>Close</title>
//       <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z" />
//     </svg>
//   );
// };

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
  const showPlaceholder = placeholderCanvas && !isInteractive;

  return (
    <PaintingStyled
      css={{
        maxHeight: configOptions.canvasHeight,
        backgroundColor: configOptions.canvasBackgroundColor,
      }}
    >
      {placeholderCanvas && (
        <Toggle
          onClick={() => setIsInteractive(!isInteractive)}
          isInteractive={isInteractive}
        >
          {isInteractive ? "Close" : "Click to View"}
        </Toggle>
      )}

      {showPlaceholder && (
        <PaintingPlaceholder
          placeholderCanvas={placeholderCanvas}
          label={normalizedCanvas?.label}
          setIsInteractive={setIsInteractive}
        />
      )}

      {!showPlaceholder && (
        <div>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
            />
          ) : (
            painting && <ImageViewer body={painting} key={activeCanvas} />
          )}
        </div>
      )}
    </PaintingStyled>
  );
};

export default Painting;
