import { PaintingCanvas, PaintingStyled } from "./Painting.styled";
import { Select, SelectOption } from "src/components/internal/Select";

import { CanvasNormalized } from "@iiif/presentation-3";
import ImageViewer from "src/components/Viewer/ImageViewer/ImageViewer";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import PaintingPlaceholder from "./Placeholder";
import Player from "src/components/Viewer/Player/Player";
import React from "react";
import Toggle from "./Toggle";
import { useViewerState } from "src/context/viewer-context";

interface PaintingProps {
  painting: LabeledIIIFExternalWebResource[];
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
  const [annotationIndex, setAnnotationIndex] = React.useState<number>(0);
  const [isInteractive, setIsInteractive] = React.useState(false);
  const { configOptions, vault } = useViewerState();
  const normalizedCanvas: CanvasNormalized = vault.get(activeCanvas);

  const placeholderCanvas = normalizedCanvas?.placeholderCanvas?.id;
  const hasPlaceholder = Boolean(placeholderCanvas);
  const hasChoice = Boolean(painting?.length > 1);
  const showPlaceholder = placeholderCanvas && !isInteractive && !isMedia;

  const handleToggle = () => setIsInteractive(!isInteractive);

  const handleCoiceChange = (value) => {
    const index = painting.findIndex((resource) => resource.id === value);
    setAnnotationIndex(index);
  };

  return (
    <PaintingStyled className="clover-viewer-painting">
      <PaintingCanvas
        style={{
          backgroundColor: configOptions.canvasBackgroundColor,
          maxHeight: configOptions.canvasHeight,
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
                allSources={painting}
                painting={painting[annotationIndex]}
                resources={resources}
              />
            ) : (
              painting && (
                <ImageViewer
                  painting={painting[annotationIndex]}
                  hasPlaceholder={hasPlaceholder}
                  key={activeCanvas}
                />
              )
            )}
          </div>
        )}
      </PaintingCanvas>
      {hasChoice && (
        <Select
          value={painting[annotationIndex]?.id}
          onValueChange={handleCoiceChange}
          maxHeight={"200px"}
        >
          {painting?.map((resource) => (
            <SelectOption
              value={resource?.id}
              key={resource?.id}
              label={resource?.label}
            />
          ))}
        </Select>
      )}
    </PaintingStyled>
  );
};

export default Painting;
