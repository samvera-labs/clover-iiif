import React from "react";
import Hls from "hls.js";
import { styled } from "@stitches/react";
import {
  IIIFExternalWebResource,
  InternationalString,
} from "@hyperion-framework/types";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import { theme } from "theme";
import { getLabel } from "hooks/use-hyperion-framework";

// Set referrer header as a NU domain: ie. meadow.rdc-staging.library.northwestern.edu

interface PlayerProps {
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
}

const Player: React.FC<PlayerProps> = ({ painting, resources }) => {
  const playerRef = React.useRef(null);

  /**
   * HLS.js binding for .m3u8 files
   * STAGING and PRODUCTION environments only
   */
  React.useEffect(() => {
    if (!painting.id || !playerRef.current) return;

    // Bind hls.js package to our <video /> element and then load the media source
    const hls = new Hls();
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
      if (hls) {
        hls.detachMedia();
        hls.destroy();
      }
    };
  }, [painting.id]);

  return (
    <PlayerWrapper>
      <video
        ref={playerRef}
        controls
        height={painting.height}
        width={painting.width}
      >
        <source src={painting.id} type={painting.type} />
        {resources.length > 0 &&
          resources.map((resource) => {
            return (
              <track
                key={resource.id}
                src={resource.id as string}
                label={
                  getLabel(
                    resource.label as InternationalString,
                    "en",
                  ) as any as string
                }
                srcLang="en"
              ></track>
            );
          })}
        Sorry, your browser doesn't support embedded videos.
      </video>
    </PlayerWrapper>
  );
};

const PlayerWrapper = styled("div", {
  flexGrow: "0",
  flexShrink: "0",
  maxHeight: "61.8vh",

  video: {
    display: "flex",
    objectFit: "cover",
    width: "100%",
    height: "100%",
    backgroundColor: theme.color.secondaryMuted,
  },
});

export default Player;
