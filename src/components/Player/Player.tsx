import React, { useEffect } from "react";
import Hls, { HlsConfig } from "hls.js";
import { PlayerWrapper } from "@/components/Player/Player.styled";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import AudioVisualizer from "@/components/Player/AudioVisualizer";
import { useViewerState } from "@/context/viewer-context";
import Track from "@/components/Player/Track";
import { getPaintingResource } from "@/hooks/use-iiif";

// Set referrer header as a NU domain: ie. meadow.rdc-staging.library.northwestern.edu

interface PlayerProps {
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
}

const Player: React.FC<PlayerProps> = ({ resources, painting }) => {
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [poster, setPoster] = React.useState<string | undefined>();
  const playerRef = React.useRef<HTMLVideoElement>(null);
  const isAudio = painting?.format?.includes("audio/");

  const viewerState: any = useViewerState();
  const { activeCanvas, configOptions, vault } = viewerState;

  /**
   * HLS.js binding for .m3u8 files
   * STAGING and PRODUCTION environments only
   */
  useEffect(() => {
    /**
     * Check that IIIF content resource ID exists and
     * we have a reffed <video> for attaching HLS
     */
    if (!painting.id || !playerRef.current) return;

    /**
     * Eject HLS attachment if file extension from
     * the IIIF content resource ID is not .m3u8
     */
    if (painting.id.split(".").pop() !== "m3u8") return;

    // Construct HLS.js config
    const config = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // @ts-ignore
      xhrSetup: function (xhr, url) {
        xhr.withCredentials = configOptions.withCredentials;
      },
    } as HlsConfig;

    // Bind hls.js package to our <video /> element and then load the media source
    const hls = new Hls(config);
    hls.attachMedia(playerRef.current);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      hls.loadSource(painting.id as string);
    });

    // Handle errors
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.error(
              `fatal ${event} network error encountered, try to recover`,
            );
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error(
              `fatal ${event} media error encountered, try to recover`,
            );
            hls.recoverMediaError();
            break;
          default:
            // cannot recover
            hls.destroy();
            break;
        }
      }
    });

    return () => {
      if (hls && playerRef.current) {
        const video: HTMLVideoElement = playerRef.current;
        hls.detachMedia();
        hls.destroy();
        video.currentTime = 0;
      }
    };
  }, [painting.id]);

  useEffect(() => {
    const canvas = vault.get(activeCanvas);
    const accompanyingCanvas = canvas.accompanyingCanvas?.id
      ? getPaintingResource(vault, canvas.accompanyingCanvas?.id)
      : null;

    const placeholderCanvas = canvas.placeholderCanvas?.id
      ? getPaintingResource(vault, canvas.placeholderCanvas?.id)
      : null;

    const conflictingCanvas = !!(accompanyingCanvas && placeholderCanvas);

    if (conflictingCanvas) {
      currentTime === 0
        ? setPoster(placeholderCanvas.id)
        : setPoster(accompanyingCanvas.id);
    } else {
      if (accompanyingCanvas) setPoster(accompanyingCanvas.id);
      if (placeholderCanvas) setPoster(placeholderCanvas.id);
    }
  }, [activeCanvas, currentTime]);

  useEffect(() => {
    if (playerRef?.current) {
      const video: HTMLVideoElement = playerRef.current;
      video?.addEventListener("timeupdate", () =>
        setCurrentTime(video.currentTime),
      );

      return () => document.removeEventListener("timeupdate", () => {});
    }
  }, [playerRef?.current]);

  return (
    <PlayerWrapper
      css={{
        backgroundColor: configOptions.canvasBackgroundColor,
        maxHeight: configOptions.canvasHeight,
      }}
    >
      <video
        id="clover-iiif-video"
        key={painting.id}
        ref={playerRef}
        controls
        height={painting.height}
        width={painting.width}
        crossOrigin="anonymous"
        poster={poster}
        style={{
          maxHeight: configOptions.canvasHeight,
        }}
      >
        <source src={painting.id} type={painting.format} />
        {resources.length > 0 &&
          resources.map((resource) => (
            <Track
              resource={resource}
              ignoreCaptionLabels={configOptions.ignoreCaptionLabels}
              key={resource.id}
            />
          ))}
        Sorry, your browser doesn't support embedded videos.
      </video>

      {isAudio && <AudioVisualizer ref={playerRef} />}
    </PlayerWrapper>
  );
};

export default Player;
