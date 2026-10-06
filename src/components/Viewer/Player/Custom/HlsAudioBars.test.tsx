import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import HlsAudioBars from "./HlsAudioBars";

const draw = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  roundRect: vi.fn(),
  fill: vi.fn(),
};
const source = { connect: vi.fn(), disconnect: vi.fn() };
const analyser = {
  fftSize: 0,
  frequencyBinCount: 256,
  getByteFrequencyData: vi.fn((samples: Uint8Array) => samples.fill(128)),
};
const createSource = vi.fn(() => source);
const resume = vi.fn(() => Promise.resolve());
const destination = {};
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let resize: ResizeObserverCallback;
const disconnectObserver = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  frames = new Map();
  frameId = 0;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    draw as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(
    120,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "clientHeight", "get").mockReturnValue(
    100,
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe() {}
      disconnect = disconnectObserver;
    },
  );
  vi.stubGlobal(
    "AudioContext",
    class {
      state = "suspended";
      destination = destination;
      resume = resume;
      createMediaElementSource = createSource;
      createAnalyser = () => analyser;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function play(media: HTMLMediaElement) {
  Object.defineProperty(media, "paused", { configurable: true, value: false });
  fireEvent.play(media);
}

it("draws live rounded bars without needing a finite stream duration, and stops when paused", () => {
  const media = document.createElement("audio");
  Object.defineProperty(media, "duration", { value: Infinity });
  const { unmount } = render(<HlsAudioBars media={media} />);
  expect(createSource).not.toHaveBeenCalled();
  play(media);
  expect(analyser.getByteFrequencyData).toHaveBeenCalled();
  expect(draw.roundRect).toHaveBeenCalledWith(
    0,
    expect.any(Number),
    4,
    expect.any(Number),
    2,
  );
  expect(draw.roundRect.mock.calls.some((call) => call[3] > 4)).toBe(true);
  expect(source.connect).toHaveBeenCalledWith(destination);
  expect(resume).toHaveBeenCalled();
  expect(frames.size).toBe(1);

  Object.defineProperty(media, "paused", { configurable: true, value: true });
  fireEvent.pause(media);
  expect(frames.size).toBe(0);
  const count = draw.clearRect.mock.calls.length;
  act(() => resize([], {} as ResizeObserver));
  expect(draw.clearRect.mock.calls.length).toBeGreaterThan(count);

  play(media);
  expect(createSource).toHaveBeenCalledTimes(1);
  unmount();
  expect(frames.size).toBe(0);
  expect(source.disconnect).toHaveBeenCalledWith(analyser);
  expect(disconnectObserver).toHaveBeenCalled();
  fireEvent.play(media);
  expect(frames.size).toBe(0);
});

it("reuses the audio source when the same media element is remounted", () => {
  const media = document.createElement("audio");
  const first = render(
    <React.StrictMode>
      <HlsAudioBars media={media} />
    </React.StrictMode>,
  );
  play(media);
  first.unmount();
  const second = render(<HlsAudioBars media={media} />);
  expect(createSource).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(1);
  second.unmount();
  expect(frames.size).toBe(0);
});

it("leaves a neutral bar field when Web Audio is unavailable", () => {
  vi.stubGlobal("AudioContext", undefined);
  const media = document.createElement("audio");
  render(<HlsAudioBars media={media} />);
  play(media);
  expect(draw.roundRect).toHaveBeenCalled();
  expect(createSource).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
});
