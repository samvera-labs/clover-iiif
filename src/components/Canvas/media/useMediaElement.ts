import { useEffect, useState } from "react";

import type { MediaPlacement } from "src/components/Canvas/layout";
import { getLabelAsString } from "src/lib/label-helpers";
import { isHls } from "src/lib/hls";

export interface MediaElementOptions {
  /** `texture` draws frames into the canvas, which needs CORS on the media. */
  presentation: "dom" | "texture";
  withCredentials?: boolean;
}

/**
 * The media element for a Canvas's video or sound, made imperatively.
 *
 * Not JSX: the renderer moves the element into its DOM layer (or reads frames from it),
 * and React must not try to own or reconcile a node that has been moved. Sound plays
 * through a `<video>` too, as the Player plays it — one element type, one transport.
 *
 * - HLS plays natively where the browser can (Safari); elsewhere `hls.js` is imported
 *   only then, never otherwise.
 * - Each WebVTT caption file becomes a `<track>`, `hidden`: Clover draws the cues itself,
 *   so they stay readable at any zoom and in either presentation.
 * - `texture` asks for CORS (`crossOrigin`), since WebGL may not read other frames;
 *   `dom` and sound do not need it. Media that will not load that way (no CORS headers,
 *   or a cached copy fetched without them) is made again without and presented as
 *   `dom`: per item, as an image without CORS is.
 */
export function useMediaElement(
  media: MediaPlacement,
  { presentation: requested, withCredentials = false }: MediaElementOptions,
): { element: HTMLVideoElement | null; presentation: "dom" | "texture" } {
  const [element, setElement] = useState<HTMLVideoElement | null>(null);
  const [corsFailed, setCorsFailed] = useState(false);
  const presentation =
    requested === "texture" && !corsFailed ? "texture" : "dom";
  const captionsKey = JSON.stringify(media.captions);

  useEffect(() => {
    let cancelled = false;
    const video = document.createElement("video");
    video.playsInline = true;
    video.preload = "metadata";
    video.className = "clover-canvas-media-element";
    const onCorsError = () => {
      // Nothing loaded at all: the CORS request itself failed.
      if (video.readyState === HTMLMediaElement.HAVE_NOTHING)
        setCorsFailed(true);
    };
    if (presentation === "texture") {
      video.crossOrigin = withCredentials ? "use-credentials" : "anonymous";
      video.addEventListener("error", onCorsError, { once: true });
    }
    if (media.poster) video.poster = media.poster;

    /*
     * A cross-origin `<track>` loads only when the video itself asks for CORS, which a
     * `dom` video does not. So each file is fetched here (CORS, as Clover fetches all
     * WebVTT) and handed to its track as a same-origin blob.
     */
    const blobs: string[] = [];
    media.captions.forEach((caption, index) => {
      const track = document.createElement("track");
      track.kind = "captions";
      if (caption.language) track.srclang = caption.language;
      track.label =
        getLabelAsString(caption.label as any) ||
        caption.language ||
        String(index + 1);
      video.appendChild(track);
      fetch(caption.id, {
        credentials: withCredentials ? "include" : "same-origin",
      })
        .then((response) => (response.ok ? response.text() : Promise.reject()))
        .then((text) => {
          if (cancelled) return;
          const url = URL.createObjectURL(
            new Blob([text], { type: "text/vtt" }),
          );
          blobs.push(url);
          track.src = url;
        })
        .catch(() => undefined);
    });

    let hls: { destroy: () => void } | null = null;
    const hlsSource = isHls(media.src, media.format);
    if (hlsSource && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return;
        const instance = new Hls({
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.withCredentials = withCredentials;
          },
        });
        instance.loadSource(media.src);
        instance.attachMedia(video);
        hls = instance;
      });
    } else {
      video.src = media.src;
    }

    // Captions are drawn by Clover, so none shows natively.
    for (const track of Array.from(video.textTracks ?? [])) {
      track.mode = "hidden";
    }

    setElement(video);
    return () => {
      cancelled = true;
      video.removeEventListener("error", onCorsError);
      video.pause();
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
      video.remove();
      blobs.forEach((url) => URL.revokeObjectURL(url));
      setElement(null);
    };
    // `captionsKey` stands in for `media.captions`, whose identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    media.src,
    media.format,
    media.poster,
    captionsKey,
    presentation,
    withCredentials,
  ]);

  return { element, presentation };
}
