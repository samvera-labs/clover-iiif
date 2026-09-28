import { CanvasNormalized } from "@iiif/presentation-3";
import React, { useEffect } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import { getPaintingResource } from "src/hooks/use-iiif";

/**
 * Everything the Viewer needs wired to a media element, independent of who created it.
 *
 * The native `<video>` and the Vidstack provider hand back the same kind of element, and
 * Vidstack drives that element through its own events rather than replacing them — so the
 * listeners below work identically either way, and `activePlayer` stays a real
 * `HTMLVideoElement` for the transcript cue in `InformationPanel/Annotation/VTT/Cue.tsx`.
 *
 * Source binding is deliberately not here: the native path sets `video.src` (and reaches for
 * hls.js itself), while Vidstack's provider owns that decision.
 */
export function usePlayerBindings(
  media: HTMLMediaElement | null,
  paintingId: string | undefined,
  onEnded?: () => void,
) {
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [poster, setPoster] = React.useState<string | undefined>();

  const onEndedRef = React.useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const viewerDispatch = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const { activeCanvas, contentStateAnnotation, isMediaPlaying, vault } =
    viewerState;

  /**
   * Publish the element itself, not a player wrapper. `Cue.tsx` sets `currentTime` and calls
   * `play()` on whatever lands here, and consumers may read `activePlayer` too.
   */
  useEffect(() => {
    if (!media) return;
    viewerDispatch({
      type: "updateActivePlayer",
      player: media as HTMLVideoElement | HTMLAudioElement,
    });
  }, [media, viewerDispatch]);

  useEffect(() => {
    const canvas: CanvasNormalized = vault.get(activeCanvas);
    if (!canvas) return;

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
    if (!media) return;

    let intervalId: NodeJS.Timeout | null = null;
    let hasStartedInterval = false;

    const onTimeUpdate = () => {
      if (!hasStartedInterval) {
        hasStartedInterval = true;
        intervalId = setInterval(() => {
          if (!media.paused && !media.ended) {
            setCurrentTime(media.currentTime);
            viewerDispatch({
              type: "updateActiveSelector",
              selector: {
                type: "PointSelector",
                t: Math.round(media.currentTime),
              },
            });
          }
        }, 500);
      }

      if (media.paused) {
        setCurrentTime(media.currentTime);
        viewerDispatch({
          type: "updateActiveSelector",
          selector: {
            type: "PointSelector",
            t: Math.round(media.currentTime),
          },
        });
      }
    };

    const onEndedHandler = () => onEndedRef.current?.();

    media.addEventListener("timeupdate", onTimeUpdate);
    media.addEventListener("ended", onEndedHandler);

    return () => {
      media.removeEventListener("timeupdate", onTimeUpdate);
      media.removeEventListener("ended", onEndedHandler);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, paintingId, activeCanvas]);

  // Auto-play when mounting a new source if media was already playing
  useEffect(() => {
    if (!media || !isMediaPlaying) return;

    const onCanPlay = () => media.play().catch(() => {});
    media.addEventListener("canplay", onCanPlay, { once: true });
    return () => media.removeEventListener("canplay", onCanPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, paintingId]);

  // Keep isMediaPlaying context in sync with actual playback state
  useEffect(() => {
    if (!media) return;

    const onPlay = () =>
      viewerDispatch({ type: "updateIsMediaPlaying", isMediaPlaying: true });
    const onPause = () => {
      if (!media.ended)
        viewerDispatch({ type: "updateIsMediaPlaying", isMediaPlaying: false });
    };

    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    return () => {
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
    };
  }, [media, paintingId, viewerDispatch]);

  /**
   * Seek to the content state annotation selector.
   */
  useEffect(() => {
    if (!contentStateAnnotation || !media) return;

    // @ts-ignore
    const selector = contentStateAnnotation?.target?.selector;
    const { type, t, value } = selector || {};
    const targetSource =
      // @ts-ignore
      contentStateAnnotation?.target?.source || contentStateAnnotation?.target;

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
      media.currentTime = t;
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
      const startValue = Number(timeFragment.split(",")[0]);
      if (Number.isNaN(startValue)) return;

      setCurrentTime(startValue);
      media.currentTime = startValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, contentStateAnnotation, activeCanvas]);

  return { currentTime, poster };
}
