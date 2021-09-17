import React from "react";
import Hls from "hls.js";

// Set referrer header as a NU domain: ie. meadow.rdc-staging.library.northwestern.edu

interface PlayerProps {
  streamingUrl: string;
}

const Player: React.FC<PlayerProps> = ({ streamingUrl = "" }) => {
  const playerRef = React.useRef();
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
    <>
      <h1>asdf</h1>
      <video ref={playerRef} controls width="900" height="500">
        <source src={streamingUrl} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </>
  );
};

export default Player;
