import React, { useEffect, useRef } from "react";
import { getAudioSource } from "./audioSource";
import { BAR_GAP, BAR_WIDTH, resolveWaveColor } from "./waveformStyle";
import { resolveCloverColor } from "src/styles/tokens";

/** Live frequency bars for HLS; no playlist fetch, decoding, or WaveSurfer dependency. */
const HlsAudioBars: React.FC<{ media: HTMLMediaElement | null }> = ({
  media,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const waveColor = resolveWaveColor(canvas);
    const accentColor = resolveCloverColor("accent", canvas);
    let node: ReturnType<typeof getAudioSource>;
    let analyser: AnalyserNode | undefined;
    let samples = new Uint8Array(0);
    let frame = 0;

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      const ratio = window.devicePixelRatio || 1;
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const count = Math.max(1, Math.floor(width / (BAR_WIDTH + BAR_GAP)));
      const progress =
        media && Number.isFinite(media.duration) && media.duration > 0
          ? media.currentTime / media.duration
          : 0;

      for (let i = 0; i < count; i++) {
        // Spread the audible spectrum over the same bar field as the file waveform.
        const sample = samples[Math.floor((i / count) * samples.length)] ?? 0;
        const barHeight = Math.max(BAR_WIDTH, (sample / 255) * height);
        const x = i * (BAR_WIDTH + BAR_GAP);
        context.fillStyle = x < progress * width ? accentColor : waveColor;
        context.beginPath();
        context.roundRect(
          x,
          (height - barHeight) / 2,
          BAR_WIDTH,
          barHeight,
          BAR_WIDTH / 2,
        );
        context.fill();
      }
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = () => {
      frame = 0;
      if (!media || media.paused || media.ended) return;
      analyser?.getByteFrequencyData(samples);
      draw();
      frame = requestAnimationFrame(tick);
    };

    const onPlay = () => {
      if (!media) return;
      // Create the graph on a playback gesture, and reuse its source if the element returns.
      if (!analyser) {
        node = getAudioSource(media);
        if (!node) return;
        analyser = node.context.createAnalyser();
        analyser.fftSize = 512;
        node.source.connect(analyser);
        samples = new Uint8Array(analyser.frequencyBinCount);
      }
      if (node?.context.state === "suspended")
        node.context.resume().catch(() => {});
      if (!frame) tick();
    };

    const reset = () => {
      stop();
      samples.fill(0);
      draw();
    };

    draw();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(draw)
        : undefined;
    observer?.observe(canvas);
    media?.addEventListener("play", onPlay);
    media?.addEventListener("pause", stop);
    media?.addEventListener("ended", stop);
    media?.addEventListener("emptied", reset);
    media?.addEventListener("error", reset);
    media?.addEventListener("timeupdate", draw);
    if (media && !media.paused && !media.ended) onPlay();

    return () => {
      stop();
      observer?.disconnect();
      media?.removeEventListener("play", onPlay);
      media?.removeEventListener("pause", stop);
      media?.removeEventListener("ended", stop);
      media?.removeEventListener("emptied", reset);
      media?.removeEventListener("error", reset);
      media?.removeEventListener("timeupdate", draw);
      // Keep the source's speaker connection: a media element can only be attached once.
      if (analyser) node?.source.disconnect(analyser);
    };
  }, [media]);

  return (
    <div
      aria-hidden="true"
      className="clover-viewer-player-waveform"
      data-mode="live"
      data-testid="clover-viewer-player-waveform"
      role="presentation"
    >
      <canvas
        className="clover-viewer-player-waveform-canvas"
        ref={canvasRef}
      />
    </div>
  );
};

export default HlsAudioBars;
