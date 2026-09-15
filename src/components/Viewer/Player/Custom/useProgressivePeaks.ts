import { useEffect, useRef, useState } from "react";

/**
 * One WebAudio source node per media element, forever.
 *
 * `createMediaElementSource` may be called only once for a given element: a second call
 * throws, and the element's audio is then routed into a graph nobody is listening to, so it
 * goes silent permanently. React will re-run effects, so the node has to outlive them —
 * keyed weakly so a discarded element can still be collected.
 */
const sourceNodes = new WeakMap<
  HTMLMediaElement,
  { context: AudioContext; source: MediaElementAudioSourceNode }
>();

function getSourceNode(media: HTMLMediaElement) {
  const existing = sourceNodes.get(media);
  if (existing) return existing;

  const Ctor =
    window.AudioContext ?? (window as any).webkitAudioContext ?? undefined;
  if (!Ctor) return undefined;

  try {
    const context: AudioContext = new Ctor();
    const source = context.createMediaElementSource(media);
    // Without this the element's audio never reaches the speakers.
    source.connect(context.destination);
    const entry = { context, source };
    sourceNodes.set(media, entry);
    return entry;
  } catch {
    // Already routed by something else, or blocked. Either way there is no waveform.
    return undefined;
  }
}

export interface ProgressivePeaks {
  /** Normalized 0–1 amplitude per bucket. Zero means "not heard yet". */
  peaks: Float32Array;
  /**
   * False once we are confident the analyser is only ever going to read silence — which for
   * a track that is audibly playing means the response lacked CORS headers, so the element is
   * tainted. Drawing a flat line would look like a silent recording rather than a failure.
   */
  isCapturing: boolean;
}

/**
 * Builds a waveform from what has actually been played.
 *
 * This is the fallback for sources that cannot be decoded ahead of time — HLS above all,
 * where the element's `src` is a MediaSource `blob:` URL that cannot be fetched at all, and
 * anything past the decode duration cap. It can only ever show the past: the region ahead of
 * the playhead stays empty until it is heard.
 */
export function useProgressivePeaks(
  media: HTMLMediaElement | null,
  duration: number | undefined,
  bucketCount: number,
  enabled: boolean,
): ProgressivePeaks {
  const peaksRef = useRef<Float32Array>(new Float32Array(bucketCount));
  const [, forceRender] = useState(0);
  const [isCapturing, setIsCapturing] = useState(true);

  // A new canvas resolution or a new track starts the picture over.
  useEffect(() => {
    peaksRef.current = new Float32Array(bucketCount);
    setIsCapturing(true);
  }, [bucketCount, media]);

  useEffect(() => {
    if (!enabled || !media || !duration || duration <= 0) return;

    const node = getSourceNode(media);
    if (!node) {
      setIsCapturing(false);
      return;
    }

    const analyser = node.context.createAnalyser();
    analyser.fftSize = 2048;
    node.source.connect(analyser);

    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;
    let silentFrames = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      frame = requestAnimationFrame(tick);

      if (media.paused || media.ended) return;

      analyser.getByteTimeDomainData(samples);

      /**
       * Byte time-domain data is centered on 128. A tainted (non-CORS) element reads exactly
       * 128 forever, which is indistinguishable from true silence in one frame but not over
       * several seconds of playback.
       */
      let peak = 0;
      for (let i = 0; i < samples.length; i++) {
        const amplitude = Math.abs(samples[i] - 128) / 128;
        if (amplitude > peak) peak = amplitude;
      }

      if (peak === 0) {
        silentFrames += 1;
        // ~3s at 60fps. Long enough to clear a genuine silent lead-in.
        if (silentFrames > 180) {
          setIsCapturing(false);
          stopped = true;
          return;
        }
      } else {
        silentFrames = 0;
      }

      const bucket = Math.min(
        bucketCount - 1,
        Math.floor((media.currentTime / duration) * bucketCount),
      );
      if (bucket >= 0 && peak > peaksRef.current[bucket]) {
        peaksRef.current[bucket] = peak;
        forceRender((n) => n + 1);
      }
    };

    const onPlay = () => {
      // Browsers create the context suspended until a gesture; playing is that gesture.
      if (node.context.state === "suspended")
        node.context.resume().catch(() => {});
      if (!frame) frame = requestAnimationFrame(tick);
    };

    media.addEventListener("play", onPlay);
    if (!media.paused) onPlay();

    return () => {
      stopped = true;
      media.removeEventListener("play", onPlay);
      if (frame) cancelAnimationFrame(frame);
      try {
        node.source.disconnect(analyser);
      } catch {
        // Already torn down.
      }
    };
  }, [bucketCount, duration, enabled, media]);

  return { peaks: peaksRef.current, isCapturing };
}
