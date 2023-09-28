import {
  CanvasNormalized,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";

import ImageViewer from "src/components/Viewer/ImageViewer/ImageViewer";
import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import PaintingPlaceholder from "./Placeholder";
import { PaintingStyled } from "./Painting.styled";
import Player from "src/components/Viewer/Player/Player";
import React from "react";
import Toggle from "./Toggle";
import { useViewerState } from "src/context/viewer-context";

interface PaintingProps {
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
  activeCanvas: string;
  isMedia: boolean;
}

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
  const showPlaceholder = placeholderCanvas && !isInteractive && !isMedia;

  const handleToggle = () => setIsInteractive(!isInteractive);

  return (
    <PaintingStyled
      css={{
        maxHeight: configOptions.canvasHeight,
        backgroundColor: configOptions.canvasBackgroundColor,
      }}
    >
      {placeholderCanvas && !isMedia && (
        <Toggle
          handleToggle={handleToggle}
          isInteractive={isInteractive}
          isMedia={isMedia}
        />
      )}

      {showPlaceholder && !isMedia && (
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
