import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

import Annotations, {
  type AnnotationPlacer,
} from "src/components/Canvas/Annotations";
import type {
  CanvasControlsConfig,
  CanvasHandle,
  CloverCanvasOptions,
  CloverCanvasProps,
} from "src/components/Canvas/Canvas.types";
import Controls from "src/components/Canvas/Controls";
import {
  type ChoiceSelections,
  canvasRectToWorld,
  canvasScene,
  findChoices,
  resolveDirection,
} from "src/components/Canvas/layout";
import ExitFullscreen from "src/components/Shared/Fullscreen/ExitFullscreen";
import { useChromeVisibility } from "src/components/Canvas/useChromeVisibility";
import useFullscreen from "src/hooks/useFullscreen";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import { join } from "src/lib/classnames";
import { getLabelAsString } from "src/lib/label-helpers";
import {
  CanvasRenderer,
  findImageServiceId,
  type SceneImage,
} from "src/lib/renderer";
import { type Rect, union } from "src/lib/renderer/math/rect";

type CanvasStatus = "loading" | "ready" | "error";

/** Video and sound: only fetched when a Canvas paints them. */
const MediaStage = lazy(() => import("src/components/Canvas/media/MediaStage"));

const ALL_CONTROLS: Required<CanvasControlsConfig> = {
  zoom: true,
  fullPage: true,
  rotation: true,
  reset: true,
};

let instances = 0;

/**
 * EXPERIMENTAL. Clover's own 2D renderer for images, video and sound, drawn with WebGL2
 * and falling back to Canvas2D. A composable standalone component, like `Image` and
 * `Map`; the Viewer will be able to swap it in for OpenSeadragon.
 *
 * It draws what it is handed — IIIF Canvases, or plain images — and knows nothing of the
 * Manifest around them: stepping through a sequence is the host's job.
 */
const Canvas: React.FC<CloverCanvasProps> = (props) => {
  // Nothing to show renders nothing, as `Image` does.
  const hasSource =
    Boolean(props.canvases?.length) ||
    toSceneImages(props.body, props.src).length > 0;
  if (!hasSource) return null;
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CanvasStage {...props} />
    </ErrorBoundary>
  );
};

const CanvasStage: React.FC<CloverCanvasProps> = ({
  canvases,
  viewingDirection,
  body,
  src,
  isTiledImage = false,
  label,
  instanceId,
  className,
  options,
  navigator = true,
  controls = true,
  controlButtons,
  annotations,
  onAnnotationActive,
  onReady,
  onViewportChange,
  onMediaElement,
  onEnded,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null);
  const [navigatorElement, setNavigatorElement] =
    useState<HTMLDivElement | null>(null);
  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const isFullscreen = useFullscreen(wrapperElement);
  // Controls and navigator show on pointer activity and fade after a pause, as the
  // Player's bar does.
  const chromeVisible = useChromeVisibility(wrapperElement, options?.hideDelay);
  // A stable id per mounted instance, for control ids; never a new one per render.
  const [instance] = useState(
    () => instanceId ?? `clover-canvas-${++instances}`,
  );
  const controlsConfig: Required<CanvasControlsConfig> | null =
    controls === false
      ? null
      : controls === true
        ? ALL_CONTROLS
        : { ...ALL_CONTROLS, ...controls };
  const [status, setStatus] = useState<CanvasStatus>("loading");
  /** Bumped whenever the scene is laid out, so world-pinned overlays re-place. */
  const [sceneVersion, setSceneVersion] = useState(0);

  // Callbacks and options are read through refs so new identities don't remount.
  const onReadyRef = useRef(onReady);
  const onViewportChangeRef = useRef(onViewportChange);
  const optionsRef = useRef<CloverCanvasOptions | undefined>(options);
  onReadyRef.current = onReady;
  onViewportChangeRef.current = onViewportChange;
  optionsRef.current = options;

  /*
   * IIIF Canvases — one, or the few a host shows together, such as a spread — with each
   * Canvas's painted images composed at their targets and the Canvases laid out by
   * `viewingDirection`. Plain `body`/`src` images otherwise.
   */
  const direction = resolveDirection(viewingDirection);
  /*
   * A Canvas's `Choice`s, and which item of each to paint: the first until the reader
   * picks another from the control. A new set of Canvases starts from the first again.
   */
  const choices = useMemo(() => findChoices(canvases ?? []), [canvases]);
  const [selections, setSelections] = useState<ChoiceSelections>({});
  const selectChoice = (key: string, index: number) =>
    setSelections((current) => ({ ...current, [key]: index }));
  const scene = useMemo(
    () =>
      canvases?.length ? canvasScene(canvases, direction, selections) : null,
    [canvases, direction, selections],
  );
  const bodyImages = useMemo(
    () => toSceneImages(body, src, isTiledImage),
    [body, src, isTiledImage],
  );
  /*
   * The first painted video or sound, if any. Its element is made by the (lazy) media
   * stage; a video is then placed in the scene like any image, while sound has no picture
   * of its own and is never placed.
   */
  const media = scene?.media[0] ?? null;
  const presentation = options?.media?.presentation ?? "dom";
  const [mediaElement, setMediaElement] = useState<HTMLVideoElement | null>(
    null,
  );
  // What the media stage settled on: `dom` if `texture` was asked of media without CORS.
  const [presented, setPresented] = useState(presentation);
  const onMediaElementRef = useRef(onMediaElement);
  onMediaElementRef.current = onMediaElement;
  const handleMediaElement = useCallback(
    (element: HTMLVideoElement | null, how: "dom" | "texture") => {
      setMediaElement(element);
      setPresented(how);
      onMediaElementRef.current?.(element);
    },
    [],
  );
  const baseImages = scene ? scene.images : bodyImages;
  /*
   * A lone video or sound Canvas is a player, not a picture to explore: it is always
   * fitted to the stage, the camera stays put, and only full screen is offered from the
   * control cluster.
   */
  const mediaOnly = Boolean(media) && canvases?.length === 1;
  /*
   * A lone media Canvas carries all its chrome in the transport at the bottom: full
   * screen moves there, and the top cluster (and the scrim behind it) is shown only for a
   * `Choice` to pick from.
   */
  const shownControls =
    controlsConfig && mediaOnly
      ? choices.length
        ? {
            ...controlsConfig,
            zoom: false,
            rotation: false,
            reset: false,
            fullPage: false,
          }
        : null
      : controlsConfig;
  /*
   * No overview of a video, which the navigator cannot draw playing. Sound keeps it for
   * an accompanying image it can be moved around, and has none otherwise.
   */
  const showNavigator =
    navigator &&
    (media
      ? media.kind === "audio" && !mediaOnly && baseImages.length > 0
      : true);
  /*
   * The video's own frame size, once known. A Canvas may declare a shape the file does
   * not have (Cookbook 0074 declares portrait for a landscape film), so the video is
   * fitted inside its target at its real aspect rather than stretched or letterboxed.
   */
  const videoSize = useVideoSize(media?.kind === "video" ? mediaElement : null);
  const videoPlacement = useMemo(
    () => (media ? containAspect(media.placement, videoSize) : null),
    [media, videoSize],
  );
  const images = useMemo<SceneImage[]>(
    () =>
      media?.kind === "video" && mediaElement && videoPlacement
        ? [
            ...baseImages,
            {
              id: media.id,
              placement: videoPlacement,
              width: videoPlacement.width,
              height: videoPlacement.height,
              media: { element: mediaElement, presentation: presented },
            },
          ]
        : baseImages,
    [baseImages, media, mediaElement, presented, videoPlacement],
  );
  // A lone video is framed by the video itself, so it fills the stage.
  const world =
    mediaOnly && media?.kind === "video" && videoSize && videoPlacement
      ? videoPlacement
      : scene
        ? union(scene.placements)
        : null;
  // Every field matters (a new region is a new picture), so compare them all. An element
  // does not serialise, so the media item's presence stands in for it.
  const imagesKey = JSON.stringify([
    baseImages,
    world,
    images.length !== baseImages.length && [
      media?.id,
      presented,
      videoPlacement,
    ],
  ]);
  /** The Canvases last drawn: when the host hands over others, frame them afresh. */
  const canvasKey = canvases?.map((canvas) => canvas.id).join("|") ?? null;
  const shownCanvases = useRef<string | null>(null);

  const ariaLabel =
    typeof label === "string" ? label : getLabelAsString(label) || undefined;
  const hasAnnotations = Boolean(annotations?.length);

  /*
   * An annotation lands on the Canvas it targets, wherever that Canvas has been placed;
   * `targetIndex` counts the handed Canvases when the target names none of them.
   */
  const placeAnnotation = useMemo<AnnotationPlacer | undefined>(() => {
    if (!scene || !canvases) return undefined;
    return (rect, targetId, targetIndex) => {
      const found = canvases.findIndex((canvas) => canvas.id === targetId);
      const index = found === -1 ? targetIndex : found;
      const placement = scene.placements[index];
      return placement
        ? canvasRectToWorld(canvases[index], placement, rect)
        : null;
    };
  }, [scene, canvases]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new CanvasRenderer(host, optionsRef.current);
    rendererRef.current = renderer;
    setRenderer(renderer);

    const offOpen = renderer.on("open", () => {
      setStatus("ready");
      setSceneVersion((v) => v + 1);
      onReadyRef.current?.(renderer as CanvasHandle);
    });
    const offChange = renderer.on("change", () => {
      setStatus("ready");
      setSceneVersion((v) => v + 1);
    });
    const offError = renderer.on("error", () => {
      if (!renderer.isOpen) setStatus("error");
    });
    const offViewport = renderer.on("viewport", () => {
      onViewportChangeRef.current?.(renderer.getBounds());
    });

    return () => {
      offOpen();
      offChange();
      offError();
      offViewport();
      renderer.dispose();
      rendererRef.current = null;
      setRenderer(null);
    };
    // A new instanceId is a new viewer; nothing else remounts the renderer.
  }, [instanceId]);

  useEffect(() => {
    if (!renderer || !navigatorElement) return;
    return renderer.attachNavigator(navigatorElement);
  }, [renderer, navigatorElement]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (!renderer.isOpen) setStatus("loading");
    const fit =
      mediaOnly ||
      (shownCanvases.current !== null && shownCanvases.current !== canvasKey);
    shownCanvases.current = canvasKey;
    renderer.setImages(images, { world: world ?? undefined, fit });
    // `imagesKey` stands in for `images`, whose identity changes on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey, instanceId, mediaElement]);

  return (
    <div
      className={join("clover-canvas", className)}
      data-testid="clover-canvas"
      data-status={status}
      data-has-navigator={showNavigator}
      data-fullscreen={isFullscreen}
      data-chrome={chromeVisible ? "visible" : "hidden"}
      data-media={media?.kind}
      data-navigable={!mediaOnly}
      ref={setWrapperElement}
    >
      {/* A dark wash behind the controls, so they read over a bright picture. */}
      {(shownControls || showNavigator) && (
        <div className="clover-canvas-scrim" aria-hidden="true" />
      )}
      {/* Revealed by CSS only while this wrapper is the full-screen element. */}
      <ExitFullscreen />
      {renderer && shownControls && (
        <Controls
          renderer={renderer}
          instance={instance}
          config={shownControls}
          controlButtons={controlButtons}
          choices={choices}
          selections={selections}
          onSelect={selectChoice}
        />
      )}
      {showNavigator && (
        <div
          ref={setNavigatorElement}
          className="clover-canvas-navigator"
          data-testid="clover-canvas-navigator"
          aria-hidden="true"
        />
      )}
      <div
        ref={hostRef}
        className="clover-canvas-viewport"
        data-testid="clover-canvas-viewport"
        /*
         * An `img` role makes its children presentational, which would hide annotation
         * buttons from assistive technology. With hotspots it is a named group instead.
         */
        role={hasAnnotations ? "group" : "img"}
        aria-label={ariaLabel}
        aria-busy={status === "loading"}
        tabIndex={0}
      />
      {renderer && media && (
        <Suspense fallback={null}>
          <MediaStage
            key={media.id}
            media={media}
            presentation={presentation}
            withCredentials={options?.withCredentials}
            renderer={renderer}
            instance={instance}
            onElement={handleMediaElement}
            navigable={!mediaOnly}
            fullscreen={mediaOnly && Boolean(controlsConfig?.fullPage)}
            isFullscreen={isFullscreen}
            onEnded={onEnded}
          />
        </Suspense>
      )}
      {renderer && hasAnnotations && sceneVersion > 0 && (
        <Annotations
          renderer={renderer}
          annotations={annotations!}
          sceneVersion={sceneVersion}
          onActiveChange={onAnnotationActive}
          place={placeAnnotation}
        />
      )}
    </div>
  );
};

/** A video element's frame size, kept current as metadata arrives or the stream changes. */
function useVideoSize(element: HTMLVideoElement | null) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  useEffect(() => {
    setSize(null);
    if (!element) return;
    const read = () => {
      const { videoWidth: width, videoHeight: height } = element;
      if (width > 0 && height > 0) {
        setSize((current) =>
          current?.width === width && current.height === height
            ? current
            : { width, height },
        );
      }
    };
    read();
    element.addEventListener("loadedmetadata", read);
    element.addEventListener("resize", read);
    return () => {
      element.removeEventListener("loadedmetadata", read);
      element.removeEventListener("resize", read);
    };
  }, [element]);
  return size;
}

/** The largest rectangle of `size`'s aspect centred inside `box`; `box` until it is known. */
export function containAspect(
  box: Rect,
  size: { width: number; height: number } | null,
): Rect {
  if (!size || !box.width || !box.height) return box;
  const scale = Math.min(box.width / size.width, box.height / size.height);
  const width = size.width * scale;
  const height = size.height * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

/**
 * Painting bodies (or plain sources) as scene images. A body with an image service is
 * tiled from that service, with `body.id` as the fallback should the service fail; one
 * without is drawn as the static image it is.
 */
export function toSceneImages(
  body: CloverCanvasProps["body"],
  src: CloverCanvasProps["src"],
  isTiledImage = false,
): SceneImage[] {
  const bodies = Array.isArray(body) ? body : body ? [body] : [];
  if (bodies.length) {
    return bodies
      .map((resource, index): SceneImage | null => {
        const service = findImageServiceId(resource.service);
        if (!service && !resource.id) return null;
        return {
          id: `${index}:${resource.id ?? service}|${resource.region ?? ""}`,
          service,
          url: resource.id,
          width: resource.width,
          height: resource.height,
          region: resource.region,
        };
      })
      .filter((image): image is SceneImage => image !== null);
  }

  const sources = Array.isArray(src) ? src : src ? [src] : [];
  return sources.filter(Boolean).map((uri, index) => ({
    id: `${index}:${uri}`,
    ...(isTiledImage ? { service: uri } : { url: uri }),
  }));
}

export type {
  IIIFCanvas,
  ViewingDirection,
} from "src/components/Canvas/layout";
export type {
  CanvasHandle,
  CloverCanvasOptions,
  CloverCanvasProps,
} from "src/components/Canvas/Canvas.types";

export default Canvas;
