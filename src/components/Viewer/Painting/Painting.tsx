import {
  Annotation,
  AnnotationPageNormalized,
  CanvasNormalized,
  InternationalString,
} from "@iiif/presentation-3";
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
import { getPaintingResource } from "src/hooks/use-iiif";
import { hashCode } from "src/lib/utils";

interface PaintingProps {
  activeCanvas: string;
  annotationResources: AnnotationResources;
  contentSearchResource?: AnnotationPageNormalized;
  isMedia: boolean;
  painting: LabeledIIIFExternalWebResource[];
}

const Painting: React.FC<PaintingProps> = ({
  activeCanvas,
  annotationResources,
  contentSearchResource,
  isMedia,
  painting,
}) => {
  const [annotationIndex, setAnnotationIndex] = React.useState<number>(0);
  const [isInteractive, setIsInteractive] = React.useState(false);
  const [imageBody, setImageBody] = React.useState<
    LabeledIIIFExternalWebResource[]
  >([]);
  const [placeholderItems, setPlaceholderItems] = React.useState<
    Array<{ id: string; label: InternationalString | null }>
  >([]);
  const {
    configOptions,
    customDisplays,
    informationPanelResource,
    openSeadragonViewer,
    vault,
    viewerId,
    visibleCanvases,
  } = useViewerState();
  const [annotations, setAnnotations] = React.useState<
    Array<{
      annotation: Annotation;
      targetIndex: number;
    }>
  >([]);

  const dispatch: any = useViewerDispatch();
  const normalizedCanvas: CanvasNormalized = vault.get(activeCanvas);
  const showPlaceholder = placeholderItems.length && !isInteractive && !isMedia;
  const hasChoice = Boolean(painting?.length > 1);
  const instanceId = `${viewerId}-${hashCode(activeCanvas + annotationIndex + JSON.stringify(visibleCanvases))}`;

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

  /** Retrieve annotations for visible canvases from Vault */
  useEffect(() => {
    const resources: Array<{
      annotation: Annotation;
      targetIndex: number;
    }> = [];

    if (informationPanelResource === "manifest-annotations")
      annotationResources?.forEach((page, pageIndex) => {
        page?.items?.forEach((item) => {
          const normalizedAnnotation = vault.get(item.id);
          if (normalizedAnnotation) {
            resources.push({
              annotation: {
                ...normalizedAnnotation,
                body: normalizedAnnotation.body.map((body) => {
                  const bodyResource = vault.get(body.id);
                  if (bodyResource) return bodyResource;
                  return body;
                }),
              },
              targetIndex: pageIndex,
            });
          }
        });
      });

    if (informationPanelResource === "manifest-content-search")
      contentSearchResource?.items?.forEach((item) => {
        const normalizedAnnotation = vault.get(item.id);
        if (normalizedAnnotation) {
          const targetIndex = visibleCanvases.findIndex(
            (canvas) => canvas.id === normalizedAnnotation.target.source.id,
          );

          if (typeof targetIndex === "number") {
            resources.push({
              annotation: {
                ...normalizedAnnotation,
                body: normalizedAnnotation.body.map((body) => {
                  const bodyResource = vault.get(body.id);
                  if (bodyResource) return bodyResource;
                  return body;
                }),
              },
              targetIndex: targetIndex,
            });
          }
        }
      });

    setAnnotations(resources);
  }, [
    annotationResources,
    contentSearchResource,
    informationPanelResource,
    visibleCanvases,
  ]);

  useEffect(() => {
    if (isMedia) {
      return;
    } else {
      const body = visibleCanvases
        .map((canvas) => {
          const canvasId = canvas.id;
          const painting = getPaintingResource(vault, canvasId);
          return painting ? painting[annotationIndex] : undefined;
        })
        .filter(Boolean) as LabeledIIIFExternalWebResource[];

      const placeholders = visibleCanvases
        .map((entry) => {
          const canvasId = entry.id;

          const canvas: CanvasNormalized = vault.get(canvasId);
          const placeholderCanvas = canvas?.placeholderCanvas?.id;
          const hasPlaceholder = Boolean(placeholderCanvas);

          if (!hasPlaceholder || !placeholderCanvas) return null;

          return {
            id: placeholderCanvas,
            label: canvas?.label,
          };
        })
        .filter((item) => item !== null);

      setImageBody(body);
      setPlaceholderItems(placeholders);
    }
  }, [
    annotationIndex,
    activeCanvas,
    visibleCanvases,
    isMedia,
    normalizedCanvas,
  ]);

  // resets the annotation index if the visible canvases change
  useEffect(() => {
    setAnnotationIndex(0);
  }, [visibleCanvases]);

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
        {Boolean(placeholderItems.length) && !isMedia && (
          <Toggle
            handleToggle={handleToggle}
            isInteractive={isInteractive}
            isMedia={isMedia}
          />
        )}
        {Boolean(placeholderItems?.length) && !isMedia && (
          <PaintingPlaceholder
            isActive={Boolean(showPlaceholder)}
            isMedia={isMedia}
            items={placeholderItems}
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
                _cloverViewerHasPlaceholder={Boolean(placeholderItems?.length)}
                annotations={annotations}
                body={imageBody}
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
