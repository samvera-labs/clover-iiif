/* eslint-disable react/display-name */

import React, { useCallback } from "react";

import { AudioVisualizerWrapper } from "src/components/Viewer/Player/AudioVisualizer.styled";

const AudioVisualizer = React.forwardRef(
  (_props, ref: React.RefObject<HTMLVideoElement>) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const audioVisualizer = useCallback(() => {
      // Block re-initialization if audio is already playing
      if (ref.current?.currentTime && ref.current?.currentTime > 0) return;

      const video = ref.current;
      if (!video) return;

      const context = new AudioContext();
      const src = context.createMediaElementSource(video);
      const analyser = context.createAnalyser();

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
      const ctx = canvas.getContext("2d");

      src.connect(analyser);
      analyser.connect(context.destination);

      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setInterval(function () {
        renderFrame(
          analyser,
          ctx,
          bufferLength,
          dataArray,
          canvas.width,
          canvas.height,
        );
      }, 20);
    }, [ref]);

    React.useEffect(() => {
      if (!ref || !ref.current) return;
      // Add a callback fn to the `<video>` onplay event

      ref.current.onplay = audioVisualizer;
    }, [audioVisualizer, ref]);

    function renderFrame(
      analyser: any,
      ctx: any,
      bufferLength: number,
      dataArray: Uint8Array,
      width: number,
      height: number,
    ) {
      const barWidth = (width / bufferLength) * 2.6;
      let barHeight: number;
      let x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2;
        ctx.fillStyle = `rgba(${78}, 42, 132, 1)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 6;
      }
    }

    return <AudioVisualizerWrapper ref={canvasRef} role="presentation" />;
  },
);

export default AudioVisualizer;
