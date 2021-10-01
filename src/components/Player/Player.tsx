import React from "react";
import Hls from "hls.js";
import { styled } from "@stitches/react";
import { IIIFExternalWebResource } from "@hyperion-framework/types";

// Set referrer header as a NU domain: ie. meadow.rdc-staging.library.northwestern.edu

const Player: React.FC<IIIFExternalWebResource> = ({
  id,
  duration,
  format,
  height,
  type,
  width,
}) => {
  const playerRef = React.useRef();

  /**
   * HLS.js binding for .m3u8 files
   * STAGING and PRODUCTION environments only
   */
  React.useEffect(() => {
    if (!id) return;

    // Bind hls.js package to our <video /> element
    // and then load the media source
    const hls = new Hls();
    hls.attachMedia(playerRef.current);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      hls.loadSource(id);
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      console.error(`data`, data);
    });
  }, [id]);

  return (
    <PlayerWrapper>
      <video ref={playerRef} controls>
        <source src={id} type={type} />
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
    backgroundColor: "#e0e0e0",
  },
});

export default Player;
