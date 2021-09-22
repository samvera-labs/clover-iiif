import React from "react";
import Hls from "hls.js";
import { styled } from "@stitches/react";

// Set referrer header as a NU domain: ie. meadow.rdc-staging.library.northwestern.edu

interface PlayerProps {
  streamingUrl: string;
  poster: string;
  source: string;
  tracks: object;
}

const Player: React.FC<PlayerProps> = ({ streamingUrl = "" }) => {
  const playerRef = React.useRef<HTMLVideoElement>(null);
  /**
   * HLS.js binding for .m3u8 files
   * STAGING and PRODUCTION environments only
   */
  React.useEffect(() => {
    if (!streamingUrl) return;

    // Bind hls.js package to our <video /> element
    // and then load the media source
    const hls = new Hls();
    hls.attachMedia(playerRef.current);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      hls.loadSource(streamingUrl);
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      console.error(`data`, data);
    });
  }, [streamingUrl]);

  return (
    <PlayerWrapper>
      <video ref={playerRef} controls width="900" height="500">
        <source src={streamingUrl} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </PlayerWrapper>
  );
};

const PlayerWrapper = styled("div", {
  width: "61.8%",
  flexGrow: "0",
  flexShrink: "0",

  video: {
    display: "flex",
    width: "100%",
    backgroundColor: "#e0e0e0",
  },
});

export default Player;
