import React, { useCallback, useEffect, useRef } from "react";

import { PrimitivesContentResource } from "src/types/primitives";
import { getLabelAsString } from "src/lib/label-helpers";
import { isHls } from "src/lib/hls";
import { sanitizeAttributes } from "src/lib/html-element";
import { styled } from "src/styles/stitches.config";
import { useGetImageResource } from "src/hooks/useGetImageResource";

const StyledResource = styled("img", { objectFit: "cover" });

const ContentResource: React.FC<PrimitivesContentResource> = (props) => {
  const mediaRef = useRef(null);
  const { contentResource, altAsLabel, region = "full" } = props;

  let alt: string | undefined;
  if (altAsLabel) alt = getLabelAsString(altAsLabel) as string;

  /**
   * Create attributes and remove React props
   */
  const remove = ["contentResource", "altAsLabel"];
  const attributes = sanitizeAttributes(props, remove);

  const { type, id, width = 200, height = 200, duration } = contentResource;

  const isHlsSource = isHls(id, contentResource.format);

  useEffect(() => {
    if (!id || !mediaRef.current) return;
    if (type === "Image") return;
    if (!isHlsSource) return;

    const video = mediaRef.current as unknown as HTMLVideoElement;

    // Native HLS support (Safari): point the element at the playlist directly.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = id as string;
      return;
    }

    // Otherwise dynamically import hls.js only when an HLS source is detected
    // and the browser doesn't natively support it.
    let cancelled = false;
    let hls: import("hls.js").default | undefined;

    (async () => {
      const { default: Hls } = await import("hls.js");
      if (cancelled || !mediaRef.current) return;

      // Browser must support MSE for hls.js to attach. If not, fall back to
      // setting the source directly so the browser can surface the failure.
      if (!Hls.isSupported()) {
        (mediaRef.current as unknown as HTMLVideoElement).src = id as string;
        return;
      }

      hls = new Hls();
      hls.attachMedia(mediaRef.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls?.loadSource(id as string);
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
      if (hls) {
        hls.detachMedia();
        hls.destroy();
      }
    };
  }, [id, type, isHlsSource]);

  const playLoop = useCallback(() => {
    if (!mediaRef.current) return;

    let startTime = 0;
    let loopTime = 30;

    if (duration) loopTime = duration;
    if (!id.split("#t=") && duration) startTime = duration * 0.1;

    if (id.split("#t=").pop()) {
      const fragment = id.split("#t=").pop();
      if (fragment) startTime = parseInt(fragment.split(",")[0]);
    }

    const media: HTMLVideoElement = mediaRef.current;
    media.autoplay = true;
    media.currentTime = startTime;

    setTimeout(() => playLoop(), loopTime * 1000);
  }, [duration, id]);

  useEffect(() => playLoop(), [playLoop]);

  const imgSrc = useGetImageResource(
    contentResource,
    `${width},${height}`,
    region,
  );

  switch (type) {
    case "Image":
      return (
        <StyledResource
          as="img"
          alt={alt}
          css={{ width: width, height: height }}
          key={id}
          src={imgSrc}
          {...attributes}
        />
      );

    case "Video":
      return (
        <StyledResource
          as="video"
          css={{ width: width, height: height }}
          disablePictureInPicture
          key={id}
          loop
          muted
          onPause={playLoop}
          ref={mediaRef}
          // Don't set `src` for HLS sources — the useEffect above attaches
          // the playlist via hls.js (or native HLS for Safari). Setting src
          // here would race the attach in non-Safari browsers.
          {...(isHlsSource ? {} : { src: id })}
        />
      );

    default:
      console.warn(
        `Resource type: ${type} is not valid or not yet supported in Primitives.`,
      );
      return <></>;
  }
};

export default ContentResource;
