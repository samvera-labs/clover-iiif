import { AnnotationNormalized, CanvasNormalized } from "@iiif/presentation-3";
import { PaintingCanvas, PaintingStyled } from "./Painting.styled";
import React, { useEffect } from "react";
import { Select, SelectOption } from "src/components/UI/Select";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import { AnnotationResources } from "src/types/annotations";
import ImageViewer from "src/components/Image";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import PaintingPlaceholder from "./Placeholder";
import Player from "src/components/Viewer/Player/Player";
import Toggle from "./Toggle";
import {
  addOverlaysToViewer,
  removeOverlaysFromViewer,
} from "src/lib/openseadragon-helpers";
import { hashCode } from "src/lib/utils";

interface PaintingProps {
  activeCanvas: string;
  annotationResources: AnnotationResources;
  isMedia: boolean;
  painting: LabeledIIIFExternalWebResource[];
}

const Painting: React.FC<PaintingProps> = ({
  activeCanvas,
  annotationResources,
  isMedia,
  painting,
}) => {
  const [annotationIndex, setAnnotationIndex] = React.useState<number>(0);
  const [isInteractive, setIsInteractive] = React.useState(false);
  const {
    configOptions,
    customDisplays,
    openSeadragonViewer,
    vault,
    viewerId,
  } = useViewerState();
  const dispatch: any = useViewerDispatch();

  const normalizedCanvas: CanvasNormalized = vault.get(activeCanvas);
  const placeholderCanvas = normalizedCanvas?.placeholderCanvas?.id;
  const hasPlaceholder = Boolean(placeholderCanvas);
  const hasChoice = Boolean(painting?.length > 1);
  const showPlaceholder = placeholderCanvas && !isInteractive && !isMedia;
  const instanceId = `${viewerId}-${hashCode(activeCanvas + annotationIndex)}`;

  const handleToggle = () => setIsInteractive(!isInteractive);

  const handleChoiceChange = (value) => {
    const index = painting.findIndex((resource) => resource.id === value);
    setAnnotationIndex(index);
  };

  /**
   * Determine whether a custom display should be used for the current canvas.
   */
  const customDisplay = customDisplays.find((customDisplay) => {
    let match = false;
    const { canvasId, paintingFormat } = customDisplay.target;

    if (Array.isArray(canvasId) && canvasId.length > 0) {
      match = canvasId.includes(activeCanvas);
    }

    if (Array.isArray(paintingFormat) && paintingFormat.length > 0) {
      const format = painting[annotationIndex]?.format || "";
      match = Boolean(format && paintingFormat.includes(format));
    }
    return match;
  });

  /** Retrieve annotations from Vault */
  const annotations: Array<AnnotationNormalized> = [];
  annotationResources[0]?.items?.forEach((item) => {
    const annotationResource = vault.get(item.id);
    annotations.push(annotationResource as unknown as AnnotationNormalized);
  });

  /** Draw annotation overlays */
  useEffect(() => {
    if (
      annotations &&
      openSeadragonViewer &&
      configOptions.annotationOverlays?.renderOverlays
    ) {
      removeOverlaysFromViewer(openSeadragonViewer, "annotation-overlay");
      addOverlaysToViewer(
        openSeadragonViewer,
        normalizedCanvas,
        configOptions.annotationOverlays,
        annotations,
        "annotation-overlay",
      );
    }
  }, [normalizedCanvas, annotations, openSeadragonViewer, configOptions]);

  /** Update OpenSeadragon Viewer in viewer context */
  const handleOpenSeadragonCallback = (viewer) => {
    // @ts-ignore
    if (viewer && openSeadragonViewer?.id !== `openseadragon-${instanceId}`) {
      dispatch({
        type: "updateOpenSeadragonViewer",
        openSeadragonViewer: viewer,
      });
    }
  };

  const CustomComponent = customDisplay?.display
    ?.component as unknown as React.ElementType;

  return (
    <PaintingStyled className="clover-viewer-painting">
      <PaintingCanvas
        style={{
          backgroundColor: configOptions.canvasBackgroundColor,
          height:
            configOptions.canvasHeight === "auto"
              ? "100%"
              : configOptions.canvasHeight,
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

        {/* Standard Viewer displays */}
        {!showPlaceholder &&
          !customDisplay &&
          (isMedia ? (
            <Player
              allSources={painting}
              painting={painting[annotationIndex]}
              annotationResources={annotationResources}
            />
          ) : (
            painting && (
              <ImageViewer
                _cloverViewerHasPlaceholder={hasPlaceholder}
                body={painting[annotationIndex]}
                instanceId={instanceId}
                key={instanceId}
                openSeadragonCallback={handleOpenSeadragonCallback}
                openSeadragonConfig={configOptions.openSeadragon}
              />
            )
          ))}

        {/* Custom display */}
        {!showPlaceholder && CustomComponent && (
          <CustomComponent
            id={activeCanvas}
            annotationBody={painting[annotationIndex]}
            {...customDisplay?.display.componentProps}
          />
        )}
      </PaintingCanvas>

      {hasChoice && (
        <Select
          value={painting[annotationIndex]?.id}
          onValueChange={handleChoiceChange}
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
