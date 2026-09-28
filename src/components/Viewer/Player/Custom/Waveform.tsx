import React, { useEffect, useMemo, useRef, useState } from "react";

import { isHls } from "src/lib/hls";
import { resolveCloverColor } from "src/styles/tokens";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { useMediaState } from "@vidstack/react";
import { useProgressivePeaks } from "src/components/Viewer/Player/Custom/useProgressivePeaks";

/**
 * The unplayed wave, anchored rather than themed.
 *
 * `.clover-viewer-player-wrapper` is always black, so the waveform paints on black whatever
 * the page theme is. A colour token would invert with the theme and disappear — the same
 * reasoning as the control bar's palette, and it reads from the same custom property so the
 * two stay in step. Progress stays on `accent`, which is a brand colour and carries on black.
 */
const WAVE_FALLBACK = "rgb(255 255 255 / 45%)";

function resolveWaveColor(element?: Element | null) {
  if (typeof window === "undefined") return WAVE_FALLBACK;
  const scope = element ?? document.documentElement;
  const value = window
    .getComputedStyle(scope)
    .getPropertyValue("--clover-player-track")
    .trim();
  return value || WAVE_FALLBACK;
}

/**
 * Past this, decoding is not worth the memory. wavesurfer resamples while decoding, but it
 * still retains the whole PCM buffer: an hour of stereo at 8kHz is ~230MB, and oral histories
 * and concert recordings of exactly that length are ordinary IIIF A/V content.
 */
const DECODE_DURATION_CAP_SECONDS = 30 * 60;

/** Ample for bar rendering, and a quarter of the memory of the 8000 default. */
const DECODE_SAMPLE_RATE = 4000;

/*
 * Wide enough that the bars read as separate marks rather than a solid trace, which matters
 * because the waveform is the timeline: the slider layered over it means clicking a bar goes
 * to that moment, so a reader has to be able to aim at one. The progressive fallback derives
 * its bucket count from the same pair, keeping both paths at the same resolution.
 */
const BAR_WIDTH = 4;
const BAR_GAP = 2;

interface WaveformProps {
  media: HTMLMediaElement | null;
  src: string;
}

/**
 * The waveform behind a Sound canvas.
 *
 * Decorative, always: `interact` is off and the canvas is `aria-hidden`. A canvas cannot take
 * focus and wavesurfer's own click-to-seek is pointer-only, so the real control is the
 * `TimeSlider` layered above this by `PlayerControls` — which is a proper ARIA slider with
 * keyboard seeking and chapter ticks. That split is what makes the waveform navigable and
 * accessible at the same time rather than one at the expense of the other.
 */
const Waveform: React.FC<WaveformProps> = ({ media, src }) => {
  const { t } = useCloverTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const duration = useMediaState("duration");

  /**
   * HLS gives us nothing to decode: an `.m3u8` is not a container, and under MSE the
   * element's `src` is a `blob:` MediaSource URL that cannot even be fetched. wavesurfer
   * swallows that rejection silently, so decide up front rather than waiting for a failure
   * that never arrives.
   */
  const canDecode =
    Boolean(src) &&
    !isHls(src) &&
    Boolean(duration) &&
    duration <= DECODE_DURATION_CAP_SECONDS;

  const [decoded, setDecoded] = useState(false);

  useEffect(() => {
    if (!canDecode || !media || !containerRef.current) return;

    let surfer: any;
    let cancelled = false;

    (async () => {
      const { default: WaveSurfer } = await import("wavesurfer.js");
      if (cancelled || !containerRef.current) return;

      surfer = WaveSurfer.create({
        barGap: BAR_GAP,
        barRadius: BAR_WIDTH,
        barWidth: BAR_WIDTH,
        container: containerRef.current,
        cursorWidth: 0,
        height: "auto",
        /**
         * Attach to the element Vidstack already owns. `url` is deliberately omitted:
         * wavesurfer resolves `options.url || this.getSrc()`, so it matches what the element
         * already has and `setSrc` early-returns. Passing a different url makes it call
         * `media.removeAttribute("src")` and never restore it, which kills playback.
         */
        media,
        // Decorative only — see the component comment.
        interact: false,
        normalize: true,
        progressColor: resolveCloverColor("accent", containerRef.current),
        sampleRate: DECODE_SAMPLE_RATE,
        // Mono. Two channels is twice the memory for a picture that reads the same.
        splitChannels: undefined,
        waveColor: resolveWaveColor(containerRef.current),
      });

      surfer.on("decode", () => !cancelled && setDecoded(true));
      surfer.on("error", () => !cancelled && setDecoded(false));
    })();

    return () => {
      cancelled = true;
      setDecoded(false);
      // Safe: wavesurfer skips element teardown for media it did not create.
      surfer?.destroy();
    };
  }, [canDecode, media, src]);

  /**
   * The fallback path. Only runs when there is nothing to decode, so the two never draw at
   * once and `createMediaElementSource` is reached for one reason only.
   */
  const bucketCount = useBucketCount(canvasRef);
  const { peaks, isCapturing } = useProgressivePeaks(
    media,
    duration,
    bucketCount,
    !canDecode,
  );

  useProgressiveCanvas(canvasRef, peaks, isCapturing);

  return (
    <div
      aria-hidden="true"
      className="clover-viewer-player-waveform"
      data-decoded={decoded || undefined}
      data-mode={canDecode ? "decoded" : "progressive"}
      data-testid="clover-viewer-player-waveform"
      role="presentation"
      title={t("playerWaveform")}
    >
      {canDecode ? (
        <div
          className="clover-viewer-player-waveform-surfer"
          ref={containerRef}
        />
      ) : (
        <canvas
          className="clover-viewer-player-waveform-canvas"
          ref={canvasRef}
        />
      )}
    </div>
  );
};

/** How many bars fit, tracked across resizes. */
function useBucketCount(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [count, setCount] = useState(120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const width = canvas.clientWidth || 0;
      if (width > 0)
        setCount(Math.max(1, Math.floor(width / (BAR_WIDTH + BAR_GAP))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef]);

  return count;
}

/** Draws the progressively captured peaks as the same bar field wavesurfer produces. */
function useProgressiveCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  peaks: Float32Array,
  isCapturing: boolean,
) {
  const colors = useMemo(
    () => ({
      wave: resolveWaveColor(canvasRef.current),
      accent: resolveCloverColor("accent", canvasRef.current ?? undefined),
    }),
    [canvasRef],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const step = BAR_WIDTH + BAR_GAP;
    const middle = height / 2;

    /**
     * A tainted element reads as digital silence, so a flat centre line would look like a
     * silent recording. Draw a low uniform field instead — honestly "no data", not "no sound".
     */
    const floor = isCapturing ? 0 : 0.12;

    context.fillStyle = colors.wave;
    for (let i = 0; i < peaks.length; i++) {
      const amplitude = Math.max(floor, peaks[i] ?? 0);
      if (amplitude <= 0) continue;

      const barHeight = Math.max(1, amplitude * height);
      context.fillRect(i * step, middle - barHeight / 2, BAR_WIDTH, barHeight);
    }
  }, [canvasRef, colors, isCapturing, peaks]);
}

export default Waveform;
