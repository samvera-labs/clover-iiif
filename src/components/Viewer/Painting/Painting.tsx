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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectOption } from "src/components/UI/Select";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import AnimationControls, {
  AnimationBar,
  AnimationControlsRow,
  AnimationThumbnailButton,
  AnimationThumbnailStrip,
} from "./AnimationControls";
import { AnnotationResources } from "src/types/annotations";
import ImageViewer from "src/components/Image";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import Map from "src/components/Map";
import PaintingPlaceholder from "./Placeholder";
import Player from "src/components/Viewer/Player/Player";
import Toggle from "./Toggle";
import {
  GeoreferenceAnnotation,
  NavPlaceDisplayLevel,
  NavPlaceResourceContext,
  NavPlaceResourceLevel,
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
} from "src/lib/georef-helpers";
import { getAnimationFrames } from "src/hooks/use-iiif/getAnimationFrames";
import { getCanvasBehavior } from "src/hooks/use-iiif/getCanvasBehavior";
import { getPaintingResource } from "src/hooks/use-iiif";
import { hashCode } from "src/lib/utils";
import { getManifestFromAnnotationTarget } from "src/lib/annotation-collection";
import {
  getTargetCanvasId,
  resolveAnnotationBodies,
} from "src/lib/annotation-helpers";

interface PaintingProps {
  activeCanvas: string;
  annotationResources: AnnotationResources;
  contentSearchResource?: AnnotationPageNormalized;
  isMedia: boolean;
  painting: LabeledIIIFExternalWebResource[];
}

const getFirstThumbnailUrl = (thumbnail: unknown): string | undefined => {
  if (!thumbnail) return undefined;
  const thumbnailList = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
  const first = thumbnailList.find(Boolean);
  if (!first || typeof first !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (first as any).id || (first as any)["@id"];
};

const getFirstHomepageUrl = (homepage: unknown): string | undefined => {
  if (!homepage) return undefined;
  const homepageList = Array.isArray(homepage) ? homepage : [homepage];
  const first = homepageList.find(Boolean);
  if (!first || typeof first !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (first as any).id || (first as any)["@id"];
};

const getNavPlaceContext = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: any,
  parent?: NavPlaceResourceContext,
): NavPlaceResourceContext | undefined => {
  if (!resource) return undefined;

  return {
    id: resource.id || resource["@id"],
    type: resource.type || resource["@type"],
    label: resource.label ?? null,
    summary: resource.summary ?? null,
    thumbnail: getFirstThumbnailUrl(resource.thumbnail),
    homepage: getFirstHomepageUrl(resource.homepage),
    parent,
  };
};

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
    annotationCollection,
    collection,
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
      if (!resource.id) return;
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

  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = thumbnailStripRef.current;
    if (!strip) return;
    const el = strip.children[annotationIndex] as HTMLElement | undefined;
    if (!el) return;
    const centeredLeft =
      el.offsetLeft - strip.offsetWidth / 2 + el.offsetWidth / 2;
    strip.scrollTo({ left: centeredLeft, behavior: "smooth" });
  }, [annotationIndex]);

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

  const [mapGeorefAnnotations, setMapGeorefAnnotations] = useState<
    GeoreferenceAnnotation[]
  >([]);

  const mapNavPlace = useMemo(() => {
    if (!configOptions.map?.enabled) return null;

    const manifest = vault.get(activeManifest);
    const canvases = visibleCanvases
      .map((canvas) => vault.get(canvas.id))
      .filter(Boolean);
    const collectionResource =
      collection && Object.keys(collection).length > 0 ? collection : null;
    const collectionContext = getNavPlaceContext(collectionResource);
    const manifestContext = getNavPlaceContext(manifest, collectionContext);
    const configuredLevel = configOptions.map.navPlaceLevel ?? "auto";

    const featuresForLevel = (level: NavPlaceResourceLevel) => {
      if (level === "Collection") {
        return collectionResource
          ? extractNavPlaceFeatures(collectionResource, {
              levels: ["Collection"],
            })
          : [];
      }

      if (level === "Manifest") {
        return manifest
          ? extractNavPlaceFeatures(manifest, {
              levels: ["Manifest"],
              parent: collectionContext,
            })
          : [];
      }

      return canvases.flatMap((canvas) =>
        extractNavPlaceFeatures(canvas, {
          levels: [level],
          parent: manifestContext,
        }),
      );
    };

    const featuresForConfiguredLevel = (
      level: NavPlaceDisplayLevel,
    ): GeoJSON.Feature[] => {
      if (level === "all") {
        return [
          ...featuresForLevel("Collection"),
          ...featuresForLevel("Manifest"),
          ...featuresForLevel("Canvas"),
          ...featuresForLevel("Annotation"),
        ];
      }

      if (level !== "auto") return featuresForLevel(level);

      const levels: NavPlaceResourceLevel[] = [
        "Annotation",
        "Canvas",
        "Manifest",
        "Collection",
      ];

      for (const candidateLevel of levels) {
        const features = featuresForLevel(candidateLevel);
        if (features.length) return features;
      }

      return [];
    };

    const features = featuresForConfiguredLevel(configuredLevel);

    return features.length ? createNavPlaceFeatureCollection(features) : null;
  }, [
    activeManifest,
    collection,
    configOptions.map?.enabled,
    configOptions.map?.navPlaceLevel,
    vault,
    visibleCanvases,
  ]);

  // Discover georeferencing annotations across the in-scope canvases and adapt
  // any Canvas-sourced annotation to the canvas's painting image service so
  // @allmaps/leaflet can warp it. `overlayScope` controls breadth: "manifest"
  // gathers every georeferenced canvas (sheets tile onto one map), "canvas"
  // follows the active/visible canvas(es).
  useEffect(() => {
    let isMounted = true;

    async function collectGeorefAnnotations() {
      if (!configOptions.map?.enabled || !configOptions.map?.showImageOverlay) {
        setMapGeorefAnnotations([]);
        return;
      }

      const scope = configOptions.map?.overlayScope ?? "manifest";
      const manifest = vault.get(activeManifest);
      const canvasIds =
        scope === "canvas"
          ? visibleCanvases.map((canvas) => canvas.id)
          : ((manifest?.items ?? []) as Array<{ id: string }>).map(
              (item) => item.id,
            );

      const collected: GeoreferenceAnnotation[] = [];
      const seen = new Set<string>();

      for (const canvasId of canvasIds) {
        const canvas = vault.get(canvasId);
        if (!canvas?.annotations?.length) continue;

        // Resolve the canvas's painting image service once for adaptation.
        const paintingBodies = getPaintingResource(vault, canvasId) ?? [];
        const imageService = paintingBodies
          .map((body) => getImageServiceId(body))
          .find(Boolean);

        const pages = vault.get(canvas.annotations) as Array<{
          id: string;
          items?: Array<{ id: string }>;
        }>;

        for (const page of pages) {
          let items = page?.items;
          if (!items || items.length === 0) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const loaded = (await vault.load(page.id)) as any;
              items = loaded?.items;
            } catch (error) {
              console.error(`Annotation page failed to load: ${error}`);
            }
          }
          if (!items?.length) continue;

          for (const itemRef of items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const annotation = vault.get(itemRef as any) as any;

            const motivations = Array.isArray(annotation?.motivation)
              ? annotation.motivation
              : [annotation?.motivation];
            if (!motivations.includes("georeferencing")) continue;
            if (annotation.id && seen.has(annotation.id)) continue;

            // The vault normalizes the FeatureCollection body into a
            // `vault://` ContentResource reference — resolve it back to the
            // GeoJSON and strip vault-internal fields before handing it to
            // @allmaps/leaflet.
            const bodyRefs = Array.isArray(annotation?.body)
              ? annotation.body
              : annotation?.body
                ? [annotation.body]
                : [];
            let featureCollection: GeoJSON.FeatureCollection | null = null;
            for (const ref of bodyRefs) {
              const resolved =
                ref?.type === "FeatureCollection"
                  ? ref
                  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (vault.get(ref as any) as any);
              if (resolved?.type === "FeatureCollection") {
                featureCollection = {
                  type: "FeatureCollection",
                  features: resolved.features ?? [],
                };
                break;
              }
            }
            if (!featureCollection) continue;

            const source = annotation.target?.source;

            // @allmaps/leaflet requires `target.selector`. Preserve a stored
            // SvgSelector when present, otherwise synthesize a full-image
            // polygon from the source dimensions.
            const storedSelectorValue = annotation.target?.selector?.value;
            const { width, height } = source ?? {};
            const selectorValue =
              storedSelectorValue ||
              (width && height
                ? `<svg width="${width}" height="${height}"><polygon points="0,0 ${width},0 ${width},${height} 0,${height}" /></svg>`
                : undefined);
            if (!selectorValue) continue; // can't warp without a selector

            const candidate: GeoreferenceAnnotation = {
              "@context": [
                "http://iiif.io/api/extension/georef/1/context.json",
                "http://iiif.io/api/presentation/3/context.json",
              ],
              id: annotation.id,
              type: "Annotation",
              motivation: "georeferencing",
              target: {
                type: "SpecificResource",
                source: {
                  id: source?.id,
                  type: source?.type,
                  width: source?.width,
                  height: source?.height,
                },
                selector: {
                  type: "SvgSelector",
                  value: selectorValue,
                },
              },
              body: featureCollection,
            };

            if (annotation.id) seen.add(annotation.id);

            if (source?.type === "Canvas") {
              if (!imageService) continue; // can't warp without an image service
              collected.push(
                adaptGeoreferenceAnnotationForOverlay(
                  candidate,
                  imageService.id,
                  imageService.type,
                ),
              );
            } else {
              collected.push(candidate);
            }
          }
        }
      }

      if (isMounted) setMapGeorefAnnotations(collected);
    }

    collectGeorefAnnotations();
    return () => {
      isMounted = false;
    };
  }, [
    activeManifest,
    configOptions.map?.enabled,
    configOptions.map?.showImageOverlay,
    configOptions.map?.overlayScope,
    vault,
    visibleCanvases,
  ]);

  const showMap = Boolean(
    !showPlaceholder &&
      !customDisplay &&
      !isMedia &&
      (mapNavPlace || mapGeorefAnnotations.length),
  );

  useEffect(() => {
    if (hasContentStateAnnotation && showPlaceholder && toggleCount === 0) {
      handleToggle();
    }
  }, [hasContentStateAnnotation, showPlaceholder]);

  useEffect(() => {
    if (showPlaceholder || showMap) {
      dispatch({
        type: "updateOpenSeadragonViewer",
        openSeadragonViewer: undefined,
      });
      dispatch({
        type: "updateActiveSelector",
        selector: undefined,
      });
    }
  }, [showPlaceholder, showMap]);

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
                body: resolveAnnotationBodies(normalizedAnnotation, vault),
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
            body: resolveAnnotationBodies(contentStateAnnotation, vault),
          },
          targetIndex: visibleCanvases.findIndex(
            (canvas) => canvas.id === contentStateAnnotationSource.id,
          ),
        });
      }

      if (annotationCollection?.pages?.length) {
        annotationCollection.pages.forEach((page) => {
          (page.items ?? []).forEach((rawAnnotation) => {
            const { canvas: canvasId } = getManifestFromAnnotationTarget(
              rawAnnotation.target,
            );
            if (!canvasId) return;

            const targetIndex = visibleCanvases.findIndex(
              (c) => c.id === canvasId,
            );
            if (targetIndex === -1) return;

            const bodies = Array.isArray(rawAnnotation.body)
              ? rawAnnotation.body
              : rawAnnotation.body
                ? [rawAnnotation.body]
                : [];

            resources.push({
              annotation: {
                id: rawAnnotation.id,
                type: "Annotation",
                motivation: rawAnnotation.motivation,
                body: bodies as any,
                target: rawAnnotation.target,
              } as Annotation,
              targetIndex,
            });
          });
        });
      }
    }

    if (informationPanelResource === "manifest-content-search") {
      contentSearchResource?.items?.forEach((item) => {
        const normalizedAnnotation = vault.get(item.id);
        if (!normalizedAnnotation) return;

        // Use getTargetCanvasId to safely resolve the canvas ID from any
        // vault-normalised target shape (source may be a string OR an object).
        const canvasId = getTargetCanvasId(normalizedAnnotation.target);
        if (!canvasId) return;

        const targetIndex = visibleCanvases.findIndex(
          (canvas) => canvas.id === canvasId,
        );

        // Only add if the canvas is currently visible (targetIndex ≥ 0)
        if (targetIndex < 0) return;

        resources.push({
          annotation: {
            ...normalizedAnnotation,
            body: resolveAnnotationBodies(normalizedAnnotation, vault),
          },
          targetIndex,
        });
      });
    }

    setAnnotations(resources);
  }, [
    annotationCollection,
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

    const placeholders = annotationCollection
      ? []
      : orderedCanvases
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
    annotationCollection,
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
        {showMap && (
          <Map
            navPlace={mapNavPlace}
            georefAnnotations={mapGeorefAnnotations}
            showImageOverlay={configOptions.map?.showImageOverlay}
            imageOverlayOpacity={configOptions.map?.imageOverlayOpacity}
            showControlPoints={configOptions.map?.showControlPoints}
            fitToData={configOptions.map?.fitToData}
          />
        )}
        {!showMap &&
          !showPlaceholder &&
          !customDisplay &&
          (isMedia ? (
            <Player
              allSources={painting}
              painting={painting[annotationIndex]}
              annotationResources={annotationResources}
              onEnded={
                isManifestAutoAdvance
                  ? () => {
                      const allCanvases = sequence[0];
                      const currentIdx = allCanvases.findIndex(
                        (c) => c.id === activeCanvas,
                      );
                      if (
                        currentIdx >= 0 &&
                        currentIdx < allCanvases.length - 1
                      ) {
                        dispatch({
                          type: "updateActiveCanvas",
                          canvasId: allCanvases[currentIdx + 1].id,
                        });
                      }
                    }
                  : undefined
              }
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
          <AnimationThumbnailStrip ref={thumbnailStripRef}>
            {animationFrames.map((frame, index) => (
              <AnimationThumbnailButton
                key={index}
                data-active={index === annotationIndex}
                type="button"
                aria-label={`Frame ${index + 1}`}
                onClick={() => {
                  setIsPlaying(false);
                  setAnnotationIndex(index);
                }}
              >
                <img src={frame.body.id} alt="" />
              </AnimationThumbnailButton>
            ))}
          </AnimationThumbnailStrip>
          <AnimationControlsRow>
            <Select
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
            </Select>
            <AnimationControls
              duration={canvasDuration}
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
                setAnnotationIndex((prev) =>
                  Math.min(totalFrames - 1, prev + 1),
                );
              }}
              onToggleRepeat={() => setIsRepeat((prev) => !prev)}
              onSetPlaybackRate={setPlaybackRate}
            />
          </AnimationControlsRow>
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
