import {
  Captions,
  MediaAnnouncer,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  Poster,
  Track,
} from "@vidstack/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CustomPlayerProps } from "src/components/Viewer/Player/Custom/CustomPlayer";
import CaptionSync from "src/components/Viewer/Player/Custom/CaptionSync";
import PlayerControls from "src/components/Viewer/Player/Custom/PlayerControls";
import Waveform from "src/components/Viewer/Player/Custom/Waveform";
import { getPlayerResources } from "src/hooks/use-iiif";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { usePlayerBindings } from "src/components/Viewer/Player/usePlayerBindings";
import { useViewerState } from "src/context/viewer-context";

/**
 * The Vidstack-backed player. Everything it shows beyond the raw transport comes out of the
 * Manifest by way of `getPlayerResources`.
 */
const PlayerMedia: React.FC<CustomPlayerProps> = ({
  allSources,
  annotationResources,
  onEnded,
  painting,
}) => {
  const { t } = useCloverTranslation();
  const playerRef = useRef<MediaPlayerInstance>(null);

  /**
   * The underlying `<video>` the provider creates. Held in state rather than a ref because
   * everything downstream — the shared bindings, the waveform — has to re-run when it
   * appears, and a ref assignment does not re-render.
   */
  const [media, setMedia] = useState<HTMLMediaElement | null>(null);

  const { activeCanvas, activeManifest, configOptions, vault } =
    useViewerState();

  const isAudio = painting?.type === "Sound";

  const { poster } = usePlayerBindings(media, painting.id, onEnded);

  const resources = useMemo(
    () =>
      getPlayerResources(vault, {
        manifestId: activeManifest,
        canvasId: activeCanvas,
        annotationResources,
        allSources,
        ignoreCaptionLabels: configOptions.ignoreCaptionLabels || [],
      }),
    [
      vault,
      activeManifest,
      activeCanvas,
      annotationResources,
      allSources,
      configOptions.ignoreCaptionLabels,
    ],
  );

  /**
   * Vidstack's HLS provider defaults `library` to a jsDelivr URL. Clover already ships
   * `hls.js` and already threads `withCredentials` into its `xhrSetup`; leaving the default
   * in place would add a hard runtime dependency on a third-party CDN, which is fatal for
   * air-gapped deployments and for anything with a restrictive CSP.
   */
  const onProviderChange = useCallback(
    (provider: MediaProviderAdapter | null) => {
      if (!provider) return;

      if ((provider as any).type === "hls") {
        (provider as any).library = () => import("hls.js");
        (provider as any).config = {
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.withCredentials = !!configOptions.withCredentials;
          },
        };
      }

      /**
       * The element the Viewer publishes as `activePlayer`, which the transcript cue in
       * `InformationPanel/Annotation/VTT/Cue.tsx` seeks directly. Vidstack observes that
       * element's own events, so driving it from outside stays in sync.
       *
       * Which accessor holds it depends on the provider Vidstack picked, and that follows
       * the source rather than `viewType`: a Sound canvas gets the AudioProvider and an
       * `<audio>` element, so `provider.video` is undefined there. There is no accessor for
       * the element on `MediaProviderAdapter` itself, so both have to be tried.
       */
      setMedia((provider as any).video ?? (provider as any).audio ?? null);
    },
    [configOptions.withCredentials],
  );

  /**
   * The Canvas duration is a hint, not a override.
   *
   * Seeding it lets the scrubber render at full width before a byte is fetched instead of
   * snapping when `loadedmetadata` arrives. But Vidstack treats the prop as authoritative
   * for as long as it is set, and a Manifest whose Canvas duration disagrees with the file
   * — which happens, and happens in Clover's own fixtures — would leave the slider pegged at
   * 100% for the rest of the track and refuse to seek past the declared end. So it is
   * withdrawn the moment the media reports its own.
   */
  const [hasRealDuration, setHasRealDuration] = useState(false);

  useEffect(() => {
    if (!media) return;
    const onLoadedMetadata = () => {
      if (Number.isFinite(media.duration) && media.duration > 0)
        setHasRealDuration(true);
    };
    onLoadedMetadata();
    media.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => media.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [media]);

  useEffect(() => setHasRealDuration(false), [painting.id]);

  const src = useMemo(() => {
    if (!painting.id) return [];
    const format = painting.format;
    return format
      ? [{ src: String(painting.id), type: format as any }]
      : [{ src: String(painting.id) } as any];
  }, [painting.id, painting.format]);

  /**
   * Vidstack's cue type requires an end. A Range may declare only a start, and
   * `getPlayerChapters` already closes those gaps against the next chapter or the canvas
   * duration — anything still open here had neither, so it cannot be drawn as a region.
   */
  const chapterCues = useMemo(
    () =>
      resources.chapters
        .filter(
          (chapter): chapter is typeof chapter & { endTime: number } =>
            typeof chapter.endTime === "number",
        )
        .map(({ startTime, endTime, text }) => ({ startTime, endTime, text })),
    [resources.chapters],
  );

  const announcerTranslations = useMemo(
    () => ({
      Play: t("playerPlay"),
      Pause: t("playerPause"),
      Mute: t("playerMute"),
      Volume: t("playerVolume"),
      "Enter Fullscreen": t("playerFullScreen"),
      "Exit Fullscreen": t("playerExitFullScreen"),
      "Enter PiP": t("playerAnnounceEnterPip"),
      "Exit PiP": t("playerAnnounceExitPip"),
      "Closed-Captions On": t("playerAnnounceCaptionsOn"),
      "Closed-Captions Off": t("playerAnnounceCaptionsOff"),
      "Seek Forward": t("playerAnnounceSeekForward"),
      "Seek Backward": t("playerAnnounceSeekBackward"),
    }),
    [t],
  );

  return (
    <MediaPlayer
      className="clover-viewer-player"
      crossOrigin={configOptions.crossOrigin ?? undefined}
      data-audio={isAudio || undefined}
      data-testid="clover-viewer-player"
      /**
       * `duration` is seeded from the Canvas so the scrubber renders at full width before a
       * byte is fetched, instead of snapping when `loadedmetadata` arrives.
       */
      duration={hasRealDuration ? undefined : resources.duration}
      /**
       * The default is `load="visible"`, which needs a real IntersectionObserver. The Viewer
       * only mounts a player for the canvas it is showing, so there is nothing to defer.
       */
      load="eager"
      onEnded={onEnded}
      onProviderChange={onProviderChange}
      playsInline
      poster={poster}
      ref={playerRef}
      /**
       * A single resolved source, not the whole `Choice`. The native path renders every
       * body as a `<source>` and lets the browser pick; Vidstack applies its own selection,
       * so the body `Painting.tsx` already selected is passed alone and the rest reach the
       * reader through the source menu instead.
       *
       * `type` is omitted rather than passed as undefined: Vidstack types it as a known
       * media mime type, and a IIIF `format` is only a SHOULD, so it may be missing or be
       * something Vidstack does not enumerate. Left off, it infers from the URL.
       */
      src={src}
      /**
       * Audio uses the video view deliberately: `viewType="audio"` collapses the media
       * surface, and a Sound canvas still needs that area for the poster and the waveform.
       */
      viewType="video"
    >
      <MediaProvider>
        {poster && (
          <Poster className="clover-viewer-player-poster" src={poster} alt="" />
        )}
        {resources.captions.map((caption) => (
          <Track
            default={caption.default}
            key={caption.src}
            kind="captions"
            label={caption.label}
            lang={caption.language}
            src={caption.src}
            type="vtt"
          />
        ))}
        {chapterCues.length > 0 && (
          <Track
            content={{ cues: chapterCues }}
            default
            kind="chapters"
            label={t("playerChapters")}
            lang="en"
            type="json"
          />
        )}
      </MediaProvider>

      {isAudio && <Waveform media={media} src={painting.id as string} />}

      <MediaAnnouncer translations={announcerTranslations} />

      <CaptionSync />

      <PlayerControls isAudio={isAudio} sources={resources.sources} />

      {/*
        Vidstack parses the VTT itself rather than letting the browser render a native
        `<track>`, so the cues need a layer of their own — without this they load and are
        never shown. It also means captions are styleable, which a native track is not.

        Ordered after the controls on purpose: the stylesheet lifts the cues clear of the bar
        with a sibling combinator, which only reaches forward, and the two overlap otherwise.
        Stacking is handled by z-index, not source order, so the bar still paints on top.
      */}
      <Captions className="clover-viewer-player-captions" />
    </MediaPlayer>
  );
};

export default PlayerMedia;
