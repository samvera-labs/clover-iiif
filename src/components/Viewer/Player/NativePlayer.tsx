import type { HlsConfig } from "hls.js";
import React, { useEffect } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { AnnotationResources } from "src/types/annotations";
import AudioVisualizer from "src/components/Viewer/Player/AudioVisualizer";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import Track from "src/components/Viewer/Player/Track";
import { collectCaptionResources } from "src/lib/annotation-helpers";
import { isHls } from "src/lib/hls";
import { usePlayerBindings } from "src/components/Viewer/Player/usePlayerBindings";

interface NativePlayerProps {
  allSources: LabeledIIIFExternalWebResource[];
  annotationResources: AnnotationResources;
  onEnded?: () => void;
  painting: LabeledIIIFExternalWebResource;
}

/**
 * The browser's own `<video controls>`. This is the default player and the accessible
 * baseline: whatever else changes, this path keeps working in every browser without
 * Clover shipping a line of transport UI.
 */
const NativePlayer: React.FC<NativePlayerProps> = ({
  allSources,
  annotationResources,
  onEnded,
  painting,
}) => {
  const playerRef = React.useRef<HTMLVideoElement>(null);
  const [media, setMedia] = React.useState<HTMLVideoElement | null>(null);

  const viewerState: ViewerContextStore = useViewerState();
  const { configOptions, vault } = viewerState;
  const isAudio = painting?.type === "Sound";

  const { poster } = usePlayerBindings(media, painting.id, onEnded);

  const captionResources = React.useMemo(
    () => collectCaptionResources(vault, annotationResources as any),
    [vault, annotationResources],
  );

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
    setMedia(video);

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
      /**
       * `video`, captured when the effect ran, rather than `playerRef.current`. By the time
       * cleanup runs the ref may already point at the next canvas's element — or at null —
       * so reading it here would either skip the teardown or rewind the wrong media.
       */
      if (hls) {
        hls.detachMedia();
        hls.destroy();
        video.currentTime = 0;
      }
    };
  }, [configOptions.withCredentials, painting.id, painting.format]);

  return (
    <div
      className="clover-viewer-player-wrapper"
      data-testid="player-wrapper"
      style={{
        backgroundColor: configOptions.canvasBackgroundColor,
        maxHeight: configOptions.canvasHeight,
        position: "relative",
      }}
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
        {/*
          Only external caption resources belong in a <track> element.

          An AnnotationPage on an A/V canvas may legitimately carry descriptive annotations
          whose bodies are embedded TextualBody resources (no `id`, no dereferenceable URL).
          Rendering those as <track src="..."> makes the browser request a subtitle file that
          does not exist. Embedded bodies also have no `id` of their own, so the Vault mints a
          content-derived `vault://<hash>`, and two bodies with the same text share a hash —
          which produced duplicate React keys.

          `collectCaptionResources` applies that gate and also opens a `Choice`, which is how
          a manifest expresses one caption track per language. It is the same collector the
          custom player's captions menu uses, so the two can never disagree.
        */}
        {captionResources.map((body) => (
          <Track
            resource={body}
            ignoreCaptionLabels={configOptions.ignoreCaptionLabels || []}
            key={body.id}
          />
        ))}
        Sorry, your browser doesn&apos;t support embedded videos.
      </video>

      {isAudio && <AudioVisualizer ref={playerRef} />}
    </div>
  );
};

export default NativePlayer;
