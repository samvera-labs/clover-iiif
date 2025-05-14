import { AnnotationNormalized, CanvasNormalized } from "@iiif/presentation-3";
import Hls, { HlsConfig } from "hls.js";
import React, { act, useEffect } from "react";
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
import { hlsMimeTypes } from "src/lib/hls";

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

  const viewerDispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const { activeCanvas, configOptions, contentStateAnnotation, vault } =
    viewerState;

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

    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video?.removeEventListener("timeupdate", onTimeUpdate);
      if (intervalId) clearInterval(intervalId);
    };
  }, [painting.id, activeCanvas]);

  /**
   * Update to video to content state annotation selector
   */
  useEffect(() => {
    if (contentStateAnnotation) {
      const video = playerRef?.current;
      if (!video) return;

      // @ts-ignore
      const { type, t, value } = contentStateAnnotation?.target?.selector;
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
