import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import Waveform from "./Waveform";

const mocks = vi.hoisted(() => ({
  imported: vi.fn(),
  create: vi.fn(),
  destroy: vi.fn(),
  duration: 60,
}));

vi.mock("@vidstack/react", () => ({
  useMediaState: () => mocks.duration,
}));
vi.mock("wavesurfer.js", () => {
  mocks.imported();
  return { default: { create: mocks.create } };
});

beforeEach(() => {
  mocks.create.mockClear();
  mocks.destroy.mockClear();
  mocks.create.mockReturnValue({ on: vi.fn(), destroy: mocks.destroy });
  mocks.duration = 60;
});

it.each([
  ["https://example.org/audio.m3u8?token=abc", undefined],
  ["https://example.org/stream", "application/vnd.apple.mpegurl"],
])(
  "uses a canvas without importing WaveSurfer for HLS: %s",
  async (src, format) => {
    const { container } = render(
      <Waveform
        media={document.createElement("audio")}
        src={src}
        format={format}
      />,
    );
    await act(() => vi.dynamicImportSettled());
    expect(mocks.imported).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(screen.getByTestId("clover-viewer-player-waveform")).toHaveAttribute(
      "data-mode",
      "live",
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  },
);

it("loads WaveSurfer for a file, then tears it down when the source becomes HLS", async () => {
  const media = document.createElement("audio");
  Object.defineProperties(media, {
    currentSrc: { value: "https://example.org/audio.mp3" },
    duration: { value: 60 },
    readyState: { value: HTMLMediaElement.HAVE_METADATA },
  });
  const { rerender } = render(
    <Waveform
      media={media}
      src="https://example.org/audio.mp3"
      format="audio/mpeg"
    />,
  );
  await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({ media, barWidth: 4, barGap: 2, interact: false }),
  );

  rerender(
    <Waveform
      media={media}
      src="https://example.org/stream"
      format="audio/x-mpegurl"
    />,
  );
  await act(() => vi.dynamicImportSettled());
  expect(mocks.destroy).toHaveBeenCalledTimes(1);
  expect(mocks.create).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("clover-viewer-player-waveform")).toHaveAttribute(
    "data-mode",
    "live",
  );
});

it("waits for the selected file's metadata before loading a waveform", async () => {
  const media = document.createElement("audio");
  let currentSrc = "https://example.org/previous.mp3";
  let readyState: number = HTMLMediaElement.HAVE_NOTHING;
  Object.defineProperties(media, {
    currentSrc: { get: () => currentSrc },
    duration: { value: 60 },
    readyState: { get: () => readyState },
  });
  render(<Waveform media={media} src="https://example.org/audio.mp3" />);
  await act(() => vi.dynamicImportSettled());
  expect(mocks.create).not.toHaveBeenCalled();

  readyState = HTMLMediaElement.HAVE_METADATA;
  await act(async () => media.dispatchEvent(new Event("loadedmetadata")));
  expect(mocks.create).not.toHaveBeenCalled();

  currentSrc = "https://example.org/audio.mp3";
  await act(async () => media.dispatchEvent(new Event("loadedmetadata")));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
});

it("keeps the decode memory cap for long non-HLS files", async () => {
  mocks.duration = 3600;
  render(
    <Waveform
      media={document.createElement("audio")}
      src="https://example.org/long.mp3"
    />,
  );
  await act(() => vi.dynamicImportSettled());
  expect(mocks.create).not.toHaveBeenCalled();
  expect(screen.getByTestId("clover-viewer-player-waveform")).toHaveAttribute(
    "data-mode",
    "progressive",
  );
});
