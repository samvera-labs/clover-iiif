import {
  Annotation,
  AnnotationPageNormalized,
  CanvasNormalized,
  InternationalString,
} from "@iiif/presentation-3";
import {
  AnimationFrameImage,
  PaintingCanvas,
  PaintingStyled,
} from "./Painting.styled";
import React, { useEffect, useMemo, useState } from "react";
import { Select, SelectOption } from "src/components/UI/Select";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import AnimationControls, { AnimationBar } from "./AnimationControls";
import { AnnotationResources } from "src/types/annotations";
import ImageViewer from "src/components/Image";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import PaintingPlaceholder from "./Placeholder";
import Player from "src/components/Viewer/Player/Player";
import Toggle from "./Toggle";
import { getAnimationFrames } from "src/hooks/use-iiif/getAnimationFrames";
import { getCanvasBehavior } from "src/hooks/use-iiif/getCanvasBehavior";
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
  const [annotationIndex, setAnnotationIndex] = useState<number>(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const [imageBody, setImageBody] = useState<LabeledIIIFExternalWebResource[]>(
    [],
  );
  const [placeholderItems, setPlaceholderItems] = useState<
    Array<{ id: string; label: InternationalString | null }>
  >([]);
  const [toggleCount, setToggleCount] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const {
    activeManifest,
    configOptions,
    customDisplays,
    contentStateAnnotation,
    informationPanelResource,
    isPaged,
    openSeadragonViewer,
    sequence,
    vault,
    viewerId,
    viewingDirection,
    visibleCanvases,
  } = useViewerState();

  const isRtlPaged = isPaged && viewingDirection === "right-to-left";
  const [annotations, setAnnotations] = useState<
    Array<{
      annotation: Annotation;
      targetIndex: number;
    }>
  >([]);

  const hasContentStateAnnotation =
    Boolean(contentStateAnnotation) &&
    // @ts-ignore
    Boolean(activeCanvas === contentStateAnnotation?.target?.source?.id);

  const dispatch: any = useViewerDispatch();
  const normalizedCanvas: CanvasNormalized = vault.get(activeCanvas);

  const {
    isAutoAdvance,
    isManifestAutoAdvance,
    isRepeat: behaviorIsRepeat,
  } = getCanvasBehavior(vault, activeCanvas, activeManifest);

  useEffect(() => {
    setIsRepeat(behaviorIsRepeat);
  }, [activeCanvas, behaviorIsRepeat]);
  const canvasDuration = normalizedCanvas?.duration ?? 0;
  const totalFrames = painting?.length ?? 0;

  // Animation mode requires auto-advance AND temporal annotation targets (#t=).
  // A canvas with auto-advance + choice annotations is not animation mode —
  // it just auto-advances after its duration with the choice select still visible.
  const animationFrames = useMemo(
    () => getAnimationFrames(vault, activeCanvas),
    [vault, activeCanvas],
  );
  const hasTemporalAnnotations = animationFrames.length > 0;
  const isAnimationMode = hasTemporalAnnotations;
  const hasChoice = Boolean(painting?.length > 1) && !isAnimationMode;

  const frameInterval =
    isAnimationMode && canvasDuration > 0 && totalFrames > 0
      ? (canvasDuration / totalFrames / playbackRate) * 1000
      : 0;

  // Auto-play only when auto-advance is set; otherwise show controls paused
  useEffect(() => {
    if (isAnimationMode && isAutoAdvance) setIsPlaying(true);
  }, [isAnimationMode, isAutoAdvance]);

  // Preload all frames so subsequent loops are smooth
  useEffect(() => {
    if (!isAnimationMode) return;
    painting.forEach((resource) => {
      const img = new window.Image();
      img.src = resource.id;
    });
  }, [isAnimationMode, painting]);

  // Advance annotationIndex on each frame interval
  useEffect(() => {
    if (!isAnimationMode || !isPlaying || frameInterval <= 0) return;

    const timer = setTimeout(() => {
      setAnnotationIndex((prev) => {
        const next = prev + 1;
        if (next >= totalFrames) {
          if (isRepeat) return 0;
          setIsPlaying(false);
          if (isManifestAutoAdvance) {
            const allCanvases = sequence[0];
            const currentIdx = allCanvases.findIndex(
              (c) => c.id === activeCanvas,
            );
            if (currentIdx >= 0 && currentIdx < allCanvases.length - 1) {
              dispatch({
                type: "updateActiveCanvas",
                canvasId: allCanvases[currentIdx + 1].id,
              });
            }
          }
          return prev;
        }
        return next;
      });
    }, frameInterval);

    return () => clearTimeout(timer);
  }, [
    isAnimationMode,
    isPlaying,
    annotationIndex,
    frameInterval,
    totalFrames,
    isRepeat,
    isManifestAutoAdvance,
    sequence,
    activeCanvas,
    dispatch,
  ]);

  const showPlaceholder = placeholderItems.length && !isInteractive && !isMedia;
  // Exclude annotationIndex from instanceId so OSD stays mounted when the
  // user changes a choice or the animation advances frames. OSD swaps images
  // via its uri-change effect rather than remounting, preserving zoom state.
  const instanceId = `${viewerId}-${hashCode(activeCanvas + JSON.stringify(visibleCanvases) + toggleCount)}`;

  const handleToggle = () => {
    setIsInteractive(!isInteractive);
    setToggleCount((prev) => prev + 1);
  };

  const handleChoiceChange = (value) => {
    const index = painting.findIndex((resource) => resource.id === value);
    setAnnotationIndex(index);
  };

  const handleFrameChange = (value: string) => {
    setIsPlaying(false);
    setAnnotationIndex(parseInt(value, 10));
  };

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

  useEffect(() => {
    if (hasContentStateAnnotation && showPlaceholder && toggleCount === 0) {
      handleToggle();
    }
  }, [hasContentStateAnnotation, showPlaceholder]);

  useEffect(() => {
    if (showPlaceholder) {
      dispatch({
        type: "updateOpenSeadragonViewer",
        openSeadragonViewer: undefined,
      });
      dispatch({
        type: "updateActiveSelector",
        selector: undefined,
      });
    }
  }, [showPlaceholder]);

  useEffect(() => {
    const resources: Array<{
      annotation: Annotation;
      targetIndex: number;
    }> = [];

    if (informationPanelResource === "manifest-annotations") {
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

      if (contentStateAnnotation) {
        const contentStateAnnotationSource =
          // @ts-ignore
          contentStateAnnotation?.target?.source ||
          contentStateAnnotation?.target;
        resources.push({
          // @ts-ignore
          annotation: {
            ...contentStateAnnotation,
            body: contentStateAnnotation?.body?.map((body) => {
              const bodyResource = vault.get(body.id);
              if (bodyResource) return bodyResource;
              return body;
            }),
          },
          targetIndex: visibleCanvases.findIndex(
            (canvas) => canvas.id === contentStateAnnotationSource.id,
          ),
        });
      }
    }

    if (informationPanelResource === "manifest-content-search") {
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
    }

    setAnnotations(resources);
  }, [
    annotationResources,
    contentSearchResource,
    contentStateAnnotation,
    informationPanelResource,
    visibleCanvases,
  ]);

  useEffect(() => {
    if (isMedia) return;

    const orderedCanvases = isRtlPaged
      ? [...visibleCanvases].reverse()
      : visibleCanvases;

    const body = orderedCanvases
      .map((canvas) => {
        const canvasId = canvas.id;
        const painting = getPaintingResource(vault, canvasId);
        return painting ? painting[annotationIndex] : undefined;
      })
      .filter(Boolean) as LabeledIIIFExternalWebResource[];

    const placeholders = orderedCanvases
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
  }, [
    annotationIndex,
    activeCanvas,
    isRtlPaged,
    visibleCanvases,
    isMedia,
    normalizedCanvas,
  ]);

  useEffect(() => {
    setAnnotationIndex(0);
  }, [visibleCanvases]);

  const handleOpenSeadragonCallback = (viewer) => {
    if (
      viewer &&
      !showPlaceholder &&
      // @ts-ignore
      openSeadragonViewer?.id !== `openseadragon-${instanceId}`
    ) {
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
          ...(configOptions.canvasHeight !== "auto" && {
            height: configOptions.canvasHeight,
          }),
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
        {!showPlaceholder && CustomComponent && (
          <CustomComponent
            id={activeCanvas}
            annotationBody={painting[annotationIndex]}
            hooks={{ useViewerDispatch, useViewerState }}
            {...customDisplay?.display.componentProps}
          />
        )}
      </PaintingCanvas>

      {isAnimationMode && !showPlaceholder && (
        <AnimationBar>
          <AnimationControls
            frameIndex={annotationIndex}
            isPlaying={isPlaying}
            isRepeat={isRepeat}
            playbackRate={playbackRate}
            totalFrames={totalFrames}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onPrevFrame={() => {
              setIsPlaying(false);
              setAnnotationIndex((prev) => Math.max(0, prev - 1));
            }}
            onNextFrame={() => {
              setIsPlaying(false);
              setAnnotationIndex((prev) => Math.min(totalFrames - 1, prev + 1));
            }}
            onToggleRepeat={() => setIsRepeat((prev) => !prev)}
            onSetPlaybackRate={setPlaybackRate}
          />
          {/* <Select
            value={String(annotationIndex)}
            onValueChange={handleFrameChange}
            maxHeight={"200px"}
          >
            {animationFrames.map((frame, index) => (
              <SelectOption
                value={String(index)}
                key={index}
                label={frame.label ?? { none: [String(index + 1)] }}
              />
            ))}
          </Select> */}
        </AnimationBar>
      )}

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
