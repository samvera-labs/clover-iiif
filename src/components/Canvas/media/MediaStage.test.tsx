import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import Canvas, { containAspect } from "src/components/Canvas";
import { stubViewport } from "src/components/Canvas/testing/viewport";
import { formatTime } from "src/components/Canvas/media/useMediaController";
import audio from "src/fixtures/iiif-cookbook/0002-mvm-audio.json";
import video from "src/fixtures/iiif-cookbook/0003-mvm-video.json";
import accompanying from "src/fixtures/iiif-cookbook/0014-accompanyingcanvas.json";
import languages from "src/fixtures/iiif-cookbook/0074-multiple-language-captions.json";
import captions from "src/fixtures/iiif-cookbook/0219-using-caption-file.json";

const listeners: Record<string, (detail?: unknown) => void> = {};
let renderer: Record<string, any>;

vi.mock("src/lib/renderer", async (importOriginal) => ({
  ...(await importOriginal<typeof import("src/lib/renderer")>()),
  CanvasRenderer: vi.fn().mockImplementation(() => renderer),
}));

let paused = true;
const play = vi.fn(function (this: HTMLMediaElement) {
  paused = false;
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
});
const pause = vi.fn(function (this: HTMLMediaElement) {
  paused = true;
  this.dispatchEvent(new Event("pause"));
});

beforeAll(() => {
  // jsdom has no media pipeline: stand in for the parts the transport drives.
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get: () => paused,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: play,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: pause,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "load", {
    configurable: true,
    value: () => undefined,
  });
});

// Each Canvas is on screen, so it loads; see the lazy-loading test for one that is not.
let viewport: ReturnType<typeof stubViewport>;
beforeEach(() => {
  viewport = stubViewport();
});
afterEach(() => viewport.restore());

beforeEach(() => {
  vi.clearAllMocks();
  paused = true;
  const host = document.createElement("div");
  host.tabIndex = 0;
  renderer = {
    host,
    setImages: vi.fn().mockResolvedValue(undefined),
    setGestures: vi.fn(),
    dispose: vi.fn(),
    isOpen: false,
    backendKind: "webgl2",
    getBounds: () => ({ x: 0, y: 0, width: 1, height: 1 }),
    attachNavigator: vi.fn(() => vi.fn()),
    on: (event: string, listener: (detail?: unknown) => void) => {
      listeners[event] = listener;
      return () => delete listeners[event];
    },
  };
  document.body.appendChild(host);
});

const transport = () => screen.findByTestId("clover-canvas-transport");

describe("Canvas media", () => {
  it("places a video in the scene once its element exists", async () => {
    const onMediaElement = vi.fn();
    render(
      <Canvas canvases={video.items as any} onMediaElement={onMediaElement} />,
    );
    await transport();

    const element = onMediaElement.mock.calls.at(-1)?.[0] as HTMLVideoElement;
    expect(element).toBeInstanceOf(HTMLVideoElement);
    expect(element.src).toBe(
      "https://fixtures.iiif.io/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4",
    );
    // DOM presentation by default, so no CORS is asked of the media.
    expect(element.crossOrigin).toBeNull();
    expect(renderer.setImages).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          placement: { x: 0, y: 0, width: 480, height: 360 },
          media: { element, presentation: "dom" },
        }),
      ],
      expect.anything(),
    );
    expect(screen.getByTestId("clover-canvas")).toHaveAttribute(
      "data-media",
      "video",
    );
    // An overview cannot show a playing frame.
    expect(screen.queryByTestId("clover-canvas-navigator")).toBeNull();
  });

  it("asks for CORS when frames are drawn as a texture", async () => {
    const onMediaElement = vi.fn();
    render(
      <Canvas
        canvases={video.items as any}
        options={{ media: { presentation: "texture" } }}
        onMediaElement={onMediaElement}
      />,
    );
    await transport();
    const element = onMediaElement.mock.calls.at(-1)?.[0] as HTMLVideoElement;
    expect(element.crossOrigin).toBe("anonymous");
    expect(renderer.setImages).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          media: { element, presentation: "texture" },
        }),
      ],
      expect.anything(),
    );

    // The CORS request fails outright: the video is made again without, and shown as DOM.
    act(() => element.dispatchEvent(new Event("error")));
    const retried = onMediaElement.mock.calls.at(-1)?.[0] as HTMLVideoElement;
    expect(retried).not.toBe(element);
    expect(retried.crossOrigin).toBeNull();
    expect(renderer.setImages).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({
          media: { element: retried, presentation: "dom" },
        }),
      ],
      expect.anything(),
    );
  });

  it("plays and pauses from the transport, a click on the picture, and the keyboard", async () => {
    render(<Canvas canvases={video.items as any} />);
    await transport();

    const toggle = screen.getByRole("button", { name: "Play" });
    fireEvent.click(toggle);
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    // A click toggles playback; double-click keeps zooming.
    expect(renderer.setGestures).toHaveBeenCalledWith({
      clickToZoom: false,
      dblClickToZoom: true,
      // A lone video never moves.
      navigable: false,
    });
    act(() => listeners.tap({ x: 1, y: 1 }));
    expect(pause).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(renderer.host, { key: "k" });
    expect(play).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(renderer.host, { key: " " });
    expect(pause).toHaveBeenCalledTimes(2);
  });

  it("seeks, skips and mutes", async () => {
    const onMediaElement = vi.fn();
    render(
      <Canvas canvases={video.items as any} onMediaElement={onMediaElement} />,
    );
    await transport();
    const element = onMediaElement.mock.calls.at(-1)?.[0] as HTMLVideoElement;

    const seek = screen.getByRole("slider", { name: "Seek" });
    // The Canvas's declared duration until the media reports its own.
    expect(seek).toHaveAttribute("max", "572.034");
    expect(seek).toHaveAttribute("aria-valuetext", "0:00 / 9:32");

    fireEvent.change(seek, { target: { value: "120" } });
    expect(element.currentTime).toBe(120);
    fireEvent.keyDown(renderer.host, { key: "l" });
    expect(element.currentTime).toBe(130);
    fireEvent.keyDown(renderer.host, { key: "j" });
    expect(element.currentTime).toBe(120);

    fireEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(element.muted).toBe(true);
    act(() => element.dispatchEvent(new Event("volumechange")));
    expect(screen.getByRole("button", { name: "Unmute" })).toBeInTheDocument();
  });

  it("tells the host when playback ends", async () => {
    const onEnded = vi.fn();
    const onMediaElement = vi.fn();
    render(
      <Canvas
        canvases={video.items as any}
        onEnded={onEnded}
        onMediaElement={onMediaElement}
      />,
    );
    await transport();
    act(() =>
      onMediaElement.mock.calls.at(-1)?.[0].dispatchEvent(new Event("ended")),
    );
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("offers caption tracks from the Canvas, with Off", async () => {
    // Fetched with CORS and handed over as a same-origin blob, since a `dom` video
    // does not ask for CORS and a cross-origin track would be refused.
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("WEBVTT\n"));
    URL.createObjectURL = vi.fn(() => "blob:http://localhost/captions");
    URL.revokeObjectURL = vi.fn();
    const onMediaElement = vi.fn();
    render(
      <Canvas
        canvases={captions.items as any}
        onMediaElement={onMediaElement}
      />,
    );
    await transport();
    const element = onMediaElement.mock.calls.at(-1)?.[0] as HTMLVideoElement;
    const track = element.querySelector("track")!;
    expect(fetch).toHaveBeenCalledWith(
      "https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt",
      { credentials: "same-origin" },
    );
    await vi.waitFor(() =>
      expect(track.src).toBe("blob:http://localhost/captions"),
    );
    expect(track.label).toBe("Captions in WebVTT format");
    expect(track.srclang).toBe("en");

    const button = screen.getByRole("button", { name: "Captions" });
    expect(button).toHaveAttribute("data-active");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("radio", { name: "Captions in WebVTT format" }),
    ).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "Off" }));
    expect(button).not.toHaveAttribute("data-active");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("plays sound through the same transport, never placed", async () => {
    const onMediaElement = vi.fn();
    render(
      <Canvas canvases={audio.items as any} onMediaElement={onMediaElement} />,
    );
    await transport();
    // Nothing reads its samples, so no CORS is asked of it.
    expect(onMediaElement.mock.calls.at(-1)?.[0].crossOrigin).toBeNull();
    expect(screen.getByTestId("clover-canvas-media")).toHaveAttribute(
      "data-kind",
      "audio",
    );
    expect(screen.queryByTestId("clover-viewer-player-waveform")).toBeNull();
    expect(screen.queryByTestId("clover-canvas-navigator")).toBeNull();
    // No picture of its own: the scene stays empty, on the 16:9 stage.
    expect(renderer.setImages).toHaveBeenLastCalledWith([], {
      world: { x: 0, y: 0, width: 1600, height: 900 },
      // Always fitted: a lone sound Canvas never moves.
      fit: true,
    });
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
  });

  it("shows sound's accompanying image, fitted, without a navigator", async () => {
    render(<Canvas canvases={accompanying.items as any} />);
    await transport();
    const [images] = renderer.setImages.mock.lastCall;
    expect(images).toHaveLength(1);
    expect(images[0].media).toBeUndefined();
    expect(screen.queryByTestId("clover-canvas-navigator")).toBeNull();
  });

  it("does not load the media stage for a Canvas of images", () => {
    render(<Canvas src="https://example.org/a.jpg" />);
    expect(screen.queryByTestId("clover-canvas-media")).toBeNull();
    expect(screen.getByTestId("clover-canvas")).not.toHaveAttribute(
      "data-media",
    );
  });
});

describe("lazy loading", () => {
  it("fetches nothing, images or media, until the Canvas nears the screen", async () => {
    viewport.restore();
    viewport = stubViewport({ onScreen: false });
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("WEBVTT\n"));
    URL.createObjectURL = vi.fn(() => "blob:http://localhost/captions");
    const onMediaElement = vi.fn();
    render(
      <Canvas
        canvases={captions.items as any}
        onMediaElement={onMediaElement}
      />,
    );
    const canvas = screen.getByTestId("clover-canvas");

    expect(renderer.setImages).not.toHaveBeenCalled();
    expect(screen.queryByTestId("clover-canvas-transport")).toBeNull();
    expect(onMediaElement).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();

    act(() => viewport.scrollIntoView(canvas));
    await transport();
    expect(renderer.setImages).toHaveBeenCalled();
    expect(onMediaElement.mock.calls.at(-1)?.[0]).toBeInstanceOf(
      HTMLVideoElement,
    );
    // Captions are fetched only now.
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("a lone media Canvas", () => {
  it("is a player: full screen in the transport, no top chrome, the camera held", async () => {
    render(<Canvas canvases={video.items as any} />);
    await transport();
    // No top cluster or scrim: full screen is in the transport, at the bottom.
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
    expect(screen.queryByTestId("openseadragon-button")).toBeNull();
    expect(document.querySelector(".clover-canvas-scrim")).toBeNull();
    const fullscreen = screen.getByRole("button", { name: "Full screen" });
    expect(fullscreen).toHaveAttribute("data-button", "fullscreen");
    expect(screen.getByTestId("clover-canvas-transport")).toContainElement(
      fullscreen,
    );
    expect(screen.getByTestId("clover-canvas")).toHaveAttribute(
      "data-navigable",
      "false",
    );
  });

  it("is fitted to the video's own aspect, not the Canvas's declared one", async () => {
    // Cookbook 0074 declares a 288 × 384 portrait Canvas for a landscape film.
    const onMediaElement = vi.fn();
    render(
      <Canvas
        canvases={languages.items as any}
        onMediaElement={onMediaElement}
      />,
    );
    await transport();
    const element = onMediaElement.mock.calls.at(-1)?.[0] as HTMLVideoElement;
    Object.defineProperties(element, {
      videoWidth: { value: 400 },
      videoHeight: { value: 300 },
    });
    act(() => element.dispatchEvent(new Event("loadedmetadata")));

    const fitted = { x: 0, y: 84, width: 288, height: 216 };
    expect(renderer.setImages).toHaveBeenLastCalledWith(
      [expect.objectContaining({ placement: fitted })],
      { world: fitted, fit: true },
    );
  });
});

describe("containAspect", () => {
  it("centres the largest rectangle of an aspect inside a box", () => {
    const box = { x: 10, y: 0, width: 200, height: 200 };
    expect(containAspect(box, { width: 16, height: 9 })).toEqual({
      x: 10,
      y: 43.75,
      width: 200,
      height: 112.5,
    });
    expect(containAspect(box, null)).toBe(box);
  });
});

describe("formatTime", () => {
  it("reads as m:ss, or h:mm:ss past an hour", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(572.034)).toBe("9:32");
    expect(formatTime(7278.466)).toBe("2:01:18");
    expect(formatTime(NaN)).toBe("0:00");
  });
});
