import { renderHook, waitFor } from "@testing-library/react";
import Hls from "hls.js";

import type { MediaPlacement } from "src/components/Canvas/layout";
import { useMediaElement } from "src/components/Canvas/media/useMediaElement";

/**
 * Desktop Chrome answers "maybe" to `canPlayType` for HLS, but its built-in player rejects
 * streams hls.js plays, such as one whose last segment has a zero `#EXTINF` duration. So
 * hls.js is used wherever it is supported, and the browser's own HLS only where it is not.
 */
describe("useMediaElement HLS", () => {
  const stream: MediaPlacement = {
    id: "stream",
    kind: "video",
    src: "https://example.org/stream.m3u8",
    format: "application/x-mpegurl",
    placement: { x: 0, y: 0, width: 16, height: 9 },
    captions: [],
  };

  let originalCanPlayType: typeof HTMLMediaElement.prototype.canPlayType;

  beforeAll(() => {
    originalCanPlayType = HTMLMediaElement.prototype.canPlayType;
    // What desktop Chrome answers for HLS now.
    HTMLMediaElement.prototype.canPlayType = () => "maybe";
  });

  afterAll(() => {
    HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
  });

  beforeEach(() => {
    // jsdom has no media pipeline.
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
      () => undefined,
    );
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("uses hls.js even when the browser says it can play HLS", async () => {
    vi.spyOn(Hls, "isSupported").mockReturnValue(true);
    const loadSource = vi
      .spyOn(Hls.prototype, "loadSource")
      .mockImplementation(() => undefined);
    const attachMedia = vi
      .spyOn(Hls.prototype, "attachMedia")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() =>
      useMediaElement(stream, { presentation: "dom" }),
    );

    await waitFor(() =>
      expect(attachMedia).toHaveBeenCalledWith(result.current.element),
    );
    expect(loadSource).toHaveBeenCalledWith(stream.src);
    expect(result.current.element?.getAttribute("src")).toBeNull();
  });

  it("falls back to the browser's own HLS where hls.js is unsupported", async () => {
    vi.spyOn(Hls, "isSupported").mockReturnValue(false);
    const attachMedia = vi.spyOn(Hls.prototype, "attachMedia");

    const { result } = renderHook(() =>
      useMediaElement(stream, { presentation: "dom" }),
    );

    await waitFor(() =>
      expect(result.current.element?.getAttribute("src")).toBe(stream.src),
    );
    expect(attachMedia).not.toHaveBeenCalled();
  });
});
