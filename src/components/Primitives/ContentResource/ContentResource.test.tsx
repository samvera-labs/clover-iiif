import { render, waitFor } from "@testing-library/react";
import Hls from "hls.js";
import React from "react";

import ContentResource from "src/components/Primitives/ContentResource/ContentResource";

/**
 * Desktop Chrome answers "maybe" to `canPlayType` for HLS, but its built-in player rejects
 * streams hls.js plays, such as one whose last segment has a zero `#EXTINF` duration. So
 * hls.js is used wherever it is supported, and the browser's own HLS only where it is not.
 */
describe("ContentResource HLS", () => {
  // With a time fragment, as `playLoop` reads its start time from one.
  const STREAM = "https://example.org/stream.m3u8#t=10";
  let originalCanPlayType: typeof HTMLMediaElement.prototype.canPlayType;

  beforeAll(() => {
    originalCanPlayType = HTMLMediaElement.prototype.canPlayType;
    // What desktop Chrome answers for HLS now.
    HTMLMediaElement.prototype.canPlayType = () => "maybe";
  });

  afterAll(() => {
    HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
  });

  afterEach(() => vi.restoreAllMocks());

  const renderStream = () =>
    render(
      <ContentResource
        contentResource={{
          id: STREAM,
          type: "Video",
          format: "application/x-mpegurl",
        }}
      />,
    );

  it("uses hls.js even when the browser says it can play HLS", async () => {
    vi.spyOn(Hls, "isSupported").mockReturnValue(true);
    const attachMedia = vi
      .spyOn(Hls.prototype, "attachMedia")
      .mockImplementation(() => undefined);

    const { container } = renderStream();
    const video = container.querySelector("video") as HTMLVideoElement;

    await waitFor(() => expect(attachMedia).toHaveBeenCalledWith(video));
    expect(video.getAttribute("src")).toBeNull();
  });

  it("falls back to the browser's own HLS where hls.js is unsupported", async () => {
    vi.spyOn(Hls, "isSupported").mockReturnValue(false);
    const attachMedia = vi.spyOn(Hls.prototype, "attachMedia");

    const { container } = renderStream();
    const video = container.querySelector("video") as HTMLVideoElement;

    await waitFor(() => expect(video.getAttribute("src")).toBe(STREAM));
    expect(attachMedia).not.toHaveBeenCalled();
  });
});
