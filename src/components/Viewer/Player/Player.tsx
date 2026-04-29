import { AnnotationNormalized, CanvasNormalized } from "@iiif/presentation-3";
import type { HlsConfig } from "hls.js";
import React, { useEffect } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import { AnnotationResources } from "src/types/annotations";
import AudioVisualizer from "src/components/Viewer/Player/AudioVisualizer";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { PlayerWrapper } from "src/components/Viewer/Player/Player.styled";
import Track from "src/components/Viewer/Player/Track";
import { getPaintingResource } from "src/hooks/use-iiif";
import { isHls } from "src/lib/hls";

interface PlayerProps {
  allSources: LabeledIIIFExternalWebResource[];
  annotationResources: AnnotationResources;
  onEnded?: () => void;
  painting: LabeledIIIFExternalWebResource;
}

const Player: React.FC<PlayerProps> = ({
  allSources,
  annotationResources,
  onEnded,
  painting,
}) => {
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [poster, setPoster] = React.useState<string | undefined>();
  const playerRef = React.useRef<HTMLVideoElement>(null);
  const onEndedRef = React.useRef(onEnded);
  React.useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const viewerDispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();

  const {
    activeCanvas,
    configOptions,
    contentStateAnnotation,
    isMediaPlaying,
    vault,
  } = viewerState;
  const isAudio = painting?.type === "Sound";

  /**
   * Source binding. Plain MP4 / WebM / etc. is set as `video.src` directly.
   * HLS playlists (.m3u8) are handed to native HLS support where available
   * (Safari) and fall back to dynamically importing `hls.js` only when we
   * actually need it. This keeps `hls.js` (~150KB) out of the initial
   * bundle for the common case.
   */
  useEffect(() => {
    if (!painting.id || !playerRef.current) return;

    const video: HTMLVideoElement = playerRef.current;
    viewerDispatch({ type: "updateActivePlayer", player: video });

    if (!isHls(painting.id, painting.format)) {
      video.src = painting.id as string;
      video.load();
      return;
    }

    // Native HLS support (Safari): just point the element at the playlist.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = painting.id as string;
      video.load();
      return;
    }

    // Otherwise, lazy-load hls.js only when we actually have an HLS source
    // and the browser doesn't natively support it.
    let cancelled = false;
    let hls: import("hls.js").default | undefined;

    (async () => {
      const { default: Hls } = await import("hls.js");
      if (cancelled || !playerRef.current) return;

      // Final guard: the browser must support MediaSource Extensions for
      // hls.js to work. If not, fall back to setting the source directly
      // and let the browser surface the failure naturally.
      if (!Hls.isSupported()) {
        playerRef.current.src = painting.id as string;
        playerRef.current.load();
        return;
      }

      const config: Partial<HlsConfig> = {
        xhrSetup: function (xhr: XMLHttpRequest) {
          xhr.withCredentials = !!configOptions.withCredentials;
        },
      };

      hls = new Hls(config);
      hls.attachMedia(playerRef.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls?.loadSource(painting.id as string);
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error(
              `fatal ${event} network error encountered, try to recover`,
            );
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error(
              `fatal ${event} media error encountered, try to recover`,
            );
            hls?.recoverMediaError();
            break;
          default:
            hls?.destroy();
            break;
        }
      });
    })();

    return () => {
      cancelled = true;
      if (hls && playerRef.current) {
        hls.detachMedia();
        hls.destroy();
        playerRef.current.currentTime = 0;
      }
    };
  }, [
    configOptions.withCredentials,
    painting.id,
    painting.format,
    viewerDispatch,
  ]);

  useEffect(() => {
    const canvas: CanvasNormalized = vault.get(activeCanvas);
    const accompanyingCanvas = canvas.accompanyingCanvas?.id
      ? getPaintingResource(vault, canvas.accompanyingCanvas?.id)
      : null;

    const placeholderCanvas = canvas.placeholderCanvas?.id
      ? getPaintingResource(vault, canvas.placeholderCanvas?.id)
      : null;

    const conflictingCanvas = !!(accompanyingCanvas && placeholderCanvas);

    if (conflictingCanvas) {
      currentTime === 0
        ? setPoster(placeholderCanvas[0].id)
        : setPoster(accompanyingCanvas[0].id);
    } else {
      if (accompanyingCanvas) setPoster(accompanyingCanvas[0].id);
      if (placeholderCanvas) setPoster(placeholderCanvas[0].id);
    }
  }, [activeCanvas, currentTime, vault]);

  useEffect(() => {
    const video = playerRef?.current;
    if (!video) return;

    let intervalId: NodeJS.Timeout | null = null;
    let hasStartedInterval = false;

    const onTimeUpdate = () => {
      if (!hasStartedInterval) {
        hasStartedInterval = true;
        intervalId = setInterval(() => {
          if (video && !video.paused && !video.ended) {
            setCurrentTime(video.currentTime);
            viewerDispatch({
              type: "updateActiveSelector",
              selector: {
                type: "PointSelector",
                t: Math.round(video.currentTime),
              },
            });
          }
        }, 500);
      }

      if (video && video.paused) {
        setCurrentTime(video.currentTime);
        viewerDispatch({
          type: "updateActiveSelector",
          selector: {
            type: "PointSelector",
            t: Math.round(video.currentTime),
          },
        });
      }
    };

    const onEndedHandler = () => onEndedRef.current?.();

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEndedHandler);

    return () => {
      video?.removeEventListener("timeupdate", onTimeUpdate);
      video?.removeEventListener("ended", onEndedHandler);
      if (intervalId) clearInterval(intervalId);
    };
  }, [painting.id, activeCanvas]);

  // Auto-play when mounting a new source if media was already playing
  useEffect(() => {
    const video = playerRef.current;
    if (!video || !isMediaPlaying) return;

    const onCanPlay = () => video.play().catch(() => {});
    video.addEventListener("canplay", onCanPlay, { once: true });
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [painting.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep isMediaPlaying context in sync with actual playback state
  useEffect(() => {
    const video = playerRef.current;
    if (!video) return;

    const onPlay = () =>
      viewerDispatch({ type: "updateIsMediaPlaying", isMediaPlaying: true });
    const onPause = () => {
      if (!video.ended)
        viewerDispatch({ type: "updateIsMediaPlaying", isMediaPlaying: false });
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [painting.id, viewerDispatch]);

  /**
   * Update to video to content state annotation selector
   */
  useEffect(() => {
    if (contentStateAnnotation) {
      const video = playerRef?.current;
      if (!video) return;

      // @ts-ignore
      const selector = contentStateAnnotation?.target?.selector;
      const { type, t, value } = selector || {};
      const targetSource =
        // @ts-ignore
        contentStateAnnotation?.target?.source ||
        contentStateAnnotation?.target;

      /**
       * Return if we are not on the canvas targeted by the
       * content state annotation
       */
      if (targetSource.id !== activeCanvas) return;

      /**
       * If the content state annotation is a PointSelector
       * and we are on the active canvas, set the current time
       * of the video to the t value of the annotation.
       */
      if (t && type === "PointSelector") {
        setCurrentTime(t);
        video.currentTime = t;
      }

      /**
       * If the content state annotation is a FragmentSelector
       * and we are on the active canvas, set the current time
       * of the video to the first fragment value of the annotation.
       * Note: this does not account for end time, only start time.
       * This is a limitation of the current implementation.
       */
      if (type === "FragmentSelector" && value) {
        const timeFragment = value.split("=")[1];
        if (!timeFragment) return;
        const startValue = timeFragment.split(",")[0];

        setCurrentTime(startValue);
        video.currentTime = startValue;
      }
    }
  }, [playerRef, contentStateAnnotation]);

  return (
    <PlayerWrapper
      css={{
        backgroundColor: configOptions.canvasBackgroundColor,
        maxHeight: configOptions.canvasHeight,
        position: "relative",
      }}
      data-testid="player-wrapper"
      className="clover-viewer-player-wrapper"
    >
      <video
        id="clover-iiif-video"
        key={painting.id}
        ref={playerRef}
        data-src={painting.id}
        controls
        height={painting.height}
        width={painting.width}
        crossOrigin={configOptions.crossOrigin}
        poster={poster}
        style={{
          maxHeight: configOptions.canvasHeight,
          position: "relative",
          zIndex: "1",
        }}
      >
        {allSources.map((painting) => (
          <source src={painting.id} type={painting.format} key={painting.id} />
        ))}
        {annotationResources?.length > 0 &&
          annotationResources.map((annotationPage) => {
            const annotationBodies: LabeledIIIFExternalWebResource[] = [];

            annotationPage.items.forEach((annotation) => {
              const annotationNormalized = vault.get(
                annotation.id,
              ) as AnnotationNormalized;

              annotationNormalized.body.forEach((body) => {
                const annotationBody = vault.get(
                  body.id,
                ) as LabeledIIIFExternalWebResource;
                annotationBodies.push(annotationBody);
              });
            });

            return annotationBodies.map((body) => {
              return (
                <Track
                  resource={body}
                  ignoreCaptionLabels={configOptions.ignoreCaptionLabels || []}
                  key={body.id}
                />
              );
            });
          })}
        Sorry, your browser doesn&apos;t support embedded videos.
      </video>

      {isAudio && <AudioVisualizer ref={playerRef} />}
    </PlayerWrapper>
  );
};

export default Player;
