import React, { useEffect, useMemo, useState } from "react";

import type { MediaPlacement } from "src/components/Canvas/layout";
import Transport from "src/components/Canvas/media/Transport";
import { useMediaController } from "src/components/Canvas/media/useMediaController";
import { useMediaElement } from "src/components/Canvas/media/useMediaElement";
import { getLabelAsString } from "src/lib/label-helpers";
import type { CanvasRenderer } from "src/lib/renderer";

const SKIP_SECONDS = 10;

export interface MediaStageProps {
  media: MediaPlacement;
  presentation: "dom" | "texture";
  withCredentials?: boolean;
  renderer: CanvasRenderer;
  instance: string;
  /**
   * The element, once made (and `null` when it goes), and how it is presented — `dom`
   * when `texture` was asked for but the media would not load with CORS.
   */
  onElement: (
    element: HTMLVideoElement | null,
    presentation: "dom" | "texture",
  ) => void;
  onEnded?: () => void;
  /** Whether the reader may pan and zoom; off for a lone video or sound. */
  navigable?: boolean;
  /** Put full screen in the transport, as a lone media Canvas does. */
  fullscreen?: boolean;
  isFullscreen?: boolean;
}

/**
 * A Canvas's video or sound: the element, its transport, and its captions.
 *
 * Loaded only when a Canvas paints media, so a page of images never downloads it. The
 * picture itself is the renderer's: this hands it the element to place, and leaves zoom,
 * pan and fullscreen to the Canvas around it.
 *
 * - A click on the picture plays or pauses, as the Player's does; double-click still
 *   zooms, except on a lone media Canvas, which never moves. On the focused Canvas, Space or K plays and pauses, M mutes, and J / L skip
 *   back and forward ten seconds.
 * - Captions are drawn here from the active track's cues, above the transport, so they
 *   read at any zoom whichever way the video is presented.
 * - Sound plays through the same element and transport, over the Canvas's accompanying
 *   or placeholder image when it has one.
 */
const MediaStage: React.FC<MediaStageProps> = ({
  media,
  presentation,
  withCredentials,
  renderer,
  instance,
  onElement,
  onEnded,
  navigable = true,
  fullscreen = false,
  isFullscreen = false,
}) => {
  const { element, presentation: presented } = useMediaElement(media, {
    presentation,
    withCredentials,
  });
  const controller = useMediaController(element, media.duration);
  // The first caption track shows by default, as the Player shows it.
  const [activeCaption, setActiveCaption] = useState(
    media.captions.length ? 0 : -1,
  );
  const [cues, setCues] = useState<string[]>([]);

  useEffect(() => {
    onElement(element, presented);
    return () => onElement(null, presented);
  }, [element, presented, onElement]);

  useEffect(() => {
    if (!element || !onEnded) return;
    element.addEventListener("ended", onEnded);
    return () => element.removeEventListener("ended", onEnded);
  }, [element, onEnded]);

  // The commands are stable per element; the controller object is new every update.
  const { toggle, toggleMute, skip } = controller;

  // A click on the picture plays and pauses; double-click (and pinch) still zoom.
  useEffect(() => {
    renderer.setGestures({
      clickToZoom: false,
      dblClickToZoom: true,
      navigable,
    });
    const off = renderer.on("tap", () => toggle());
    return () => {
      off();
      renderer.setGestures({});
    };
  }, [renderer, toggle, navigable]);

  useEffect(() => {
    const host = renderer.host;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== host || event.altKey || event.metaKey) return;
      if (event.ctrlKey) return;
      const key = event.key.toLowerCase();
      if (key === " " || key === "k") toggle();
      else if (key === "m") toggleMute();
      else if (key === "j") skip(-SKIP_SECONDS);
      else if (key === "l") skip(SKIP_SECONDS);
      else return;
      event.preventDefault();
    };
    host.addEventListener("keydown", onKeyDown);
    return () => host.removeEventListener("keydown", onKeyDown);
  }, [renderer, toggle, toggleMute, skip]);

  // Show the chosen track's cues; every track stays `hidden` so none draws natively.
  useEffect(() => {
    if (!element) return;
    const tracks = Array.from(element.textTracks ?? []);
    tracks.forEach((track) => (track.mode = "hidden"));
    const track = tracks[activeCaption];
    setCues([]);
    if (!track) return;
    const update = () =>
      setCues(
        Array.from(track.activeCues ?? []).map((cue) =>
          // Voice and styling tags (`<v Speaker>`, `<i>`) are dropped; the words stay.
          ((cue as VTTCue).text ?? "").replace(/<[^>]*>/g, ""),
        ),
      );
    track.addEventListener("cuechange", update);
    update();
    return () => track.removeEventListener("cuechange", update);
  }, [element, activeCaption]);

  const captionLabels = useMemo(
    () =>
      media.captions.map((caption, index) => ({
        label:
          getLabelAsString(caption.label as any) ||
          caption.language ||
          String(index + 1),
      })),
    [media.captions],
  );

  return (
    <div
      className="clover-canvas-media"
      data-kind={media.kind}
      data-testid="clover-canvas-media"
    >
      <Transport
        instance={instance}
        controller={controller}
        kind={media.kind}
        captions={captionLabels}
        activeCaption={activeCaption}
        onCaptionChange={setActiveCaption}
        fullscreen={fullscreen}
        isFullscreen={isFullscreen}
      />
      {/* After the transport: the stylesheet lifts the cues clear of it. */}
      {cues.length > 0 && (
        <div className="clover-canvas-captions" aria-live="off">
          {cues.map((text, index) => (
            <span className="clover-canvas-captions-cue" key={index}>
              {text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaStage;
