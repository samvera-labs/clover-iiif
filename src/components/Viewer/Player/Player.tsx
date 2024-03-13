import { AnnotationNormalized, CanvasNormalized } from "@iiif/presentation-3";
import Hls, { HlsConfig } from "hls.js";
import React, { useEffect } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import { AnnotationResources } from "src/types/annotations";
import { AudioVisualizerBase } from "src/components/Viewer/Player/AudioVisualizerBase";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { PlayerWrapper } from "src/components/Viewer/Player/Player.styled";
import Track from "src/components/Viewer/Player/Track";
import { getPaintingResource } from "src/hooks/use-iiif";
import { hlsMimeTypes } from "src/lib/hls";

// Set referrer header as a NU domain: ie. meadow.rdc-staging.library.northwestern.edu

interface PlayerProps {
  allSources: LabeledIIIFExternalWebResource[];
  annotationResources: AnnotationResources;
  painting: LabeledIIIFExternalWebResource;
}

const Player: React.FC<PlayerProps> = ({
  allSources,
  annotationResources,
  painting,
}) => {
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [poster, setPoster] = React.useState<string | undefined>();
  const playerRef = React.useRef<HTMLVideoElement>(null);
  const isAudio = painting?.type === "Sound";

  const viewerState: ViewerContextStore = useViewerState();
  const { activeCanvas, configOptions, vault } = viewerState;
  const audioVisualizerComponent = configOptions?.audioVisualizer
    ?.component as AudioVisualizerBase;
  const audioVisualizerProps = configOptions?.audioVisualizer?.props || {};

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

    if (playerRef?.current) {
      const video: HTMLVideoElement = playerRef.current;
      video.src = painting.id as string;
      video.load();
    }

    /**
     * Eject HLS attachment if file extension from
     * the IIIF content resource ID is not .m3u8
     * and format is not one of many m3u8 formats.
     */
    if (
      painting.id.split(".").pop() !== "m3u8" &&
      painting.format &&
      !hlsMimeTypes.includes(painting.format)
    )
      return;

    // Construct HLS.js config
    const config = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      xhrSetup: function (xhr, url) {
        xhr.withCredentials = !!configOptions.withCredentials;
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
  }, [configOptions.withCredentials, painting.id]);

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
    if (playerRef?.current) {
      const video: HTMLVideoElement = playerRef.current;
      video?.addEventListener("timeupdate", () =>
        setCurrentTime(video.currentTime),
      );

      return () => document.removeEventListener("timeupdate", () => {});
    }
  }, []);

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
        controls
        height={painting.height}
        width={painting.width}
        crossOrigin="anonymous"
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

      {isAudio &&
        React.createElement(audioVisualizerComponent, {
          ...audioVisualizerProps,
          ref: playerRef,
        })}
    </PlayerWrapper>
  );
};

export default Player;
