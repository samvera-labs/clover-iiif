import React from "react";

const AudioVisualizer = React.forwardRef((props, ref: any) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isSafari = false;

  React.useEffect(() => {
    if (!ref) return;
    console.log(`ref`, ref);
    ref.current.onplay = audioVisualizer;
  }, [ref]);

  function audioVisualizer() {
    console.log(`audioVisualizer loads`);
    const video = ref.current;
    const context = new AudioContext();
    const src = context.createMediaElementSource(video);
    let analyser = context.createAnalyser();

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    console.log(`bufferLength`, bufferLength);
    const dataArray = new Uint8Array(bufferLength);
    console.log(`dataArray`, dataArray);

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
  }

  function renderFrame(
    analyser: any,
    ctx: any,
    bufferLength: number,
    dataArray: Uint8Array,
    width: number,
    height: number,
  ) {
    let barWidth = (width / bufferLength) * 2.6;
    let barHeight;
    let x = 0;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * 4;
      //console.log(`barHeight`, barHeight);

      const r = 26 + i * 4;
      const g = 114;
      const b = 197;
      const alpha = 1;

      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 6;
    }
  }

  return (
    <div className="canopy-video-background">
      <canvas id="canopy-audio-visualizer" ref={canvasRef}></canvas>
    </div>
  );
});

export default AudioVisualizer;
