import { describe, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { AnnotationResources } from "src/types/annotations";
import Hls from "hls.js";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import Player from "src/components/Viewer/Player/Player";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import { ViewerProvider, defaultState } from "src/context/viewer-context";
import manifestSimpleAudio from "src/fixtures/viewer/player/manifest-simple-audio.json";
import manifestStreaming from "src/fixtures/viewer/player/manifest-streaming-audio.json";

describe("Player component", () => {
  let originalLoad: any;

  let originalCanPlayType: any;

  beforeAll(() => {
    originalLoad = window.HTMLMediaElement.prototype.load;
    window.HTMLMediaElement.prototype.load = () => {
      /* do nothing */
    };
    // Force the non-native HLS path (i.e. hls.js fallback) so we can assert
    // that attachMedia is called. jsdom's canPlayType returns "" for
    // unknown types, which would already cause the fallback, but we stub
    // it explicitly to make the test intent clear.
    originalCanPlayType = window.HTMLMediaElement.prototype.canPlayType;
    window.HTMLMediaElement.prototype.canPlayType = () => "";
  });

  afterAll(() => {
    window.HTMLMediaElement.prototype.load = originalLoad;
    window.HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
  });

  it("renders the Player component for a streaming audio file", async () => {
    const allSources = [
      {
        id: "https://meadow-streaming.rdc-staging.library.northwestern.edu/03/4a/07/03/-b/4d/3-/48/62/-b/fd/f-/85/f5/ba/8e/d1/40/034a0703-b4d3-4862-bfdf-85f5ba8ed140.m3u8",
        type: "Sound",
        format: "application/x-mpegurl",
        height: 100,
        width: 100,
        duration: 268.776,
      },
    ];

    const painting = {
      id: "https://meadow-streaming.rdc-staging.library.northwestern.edu/03/4a/07/03/-b/4d/3-/48/62/-b/fd/f-/85/f5/ba/8e/d1/40/034a0703-b4d3-4862-bfdf-85f5ba8ed140.m3u8",
      type: "Sound",
      format: "application/x-mpegurl",
      height: 100,
      width: 100,
      duration: 268.776,
    };

    const annotationResources = [];

    const props = {
      allSources: allSources as LabeledIIIFExternalWebResource[],
      painting: painting as LabeledIIIFExternalWebResource,
      annotationResources: annotationResources as AnnotationResources,
    };

    const vault = new Vault();
    await vault.loadManifest("", manifestStreaming);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeCanvas:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif/canvas/access/0",
          activeManifest:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif",
          vault,
        }}
      >
        <Player {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("player-wrapper")).toBeInTheDocument();

    // Test for the audio visualizer
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  it("renders the Player component for a streaming audio file even if a parameter is at the end, loading hls", async () => {
    const allSources = [
      {
        id: "https://meadow-streaming.rdc-staging.library.northwestern.edu/03/4a/07/03/-b/4d/3-/48/62/-b/fd/f-/85/f5/ba/8e/d1/40/034a0703-b4d3-4862-bfdf-85f5ba8ed140.m3u8?test=1",
        type: "Sound",
        format: "application/x-mpegurl",
        height: 100,
        width: 100,
        duration: 268.776,
      },
    ];

    const painting = {
      id: "https://meadow-streaming.rdc-staging.library.northwestern.edu/03/4a/07/03/-b/4d/3-/48/62/-b/fd/f-/85/f5/ba/8e/d1/40/034a0703-b4d3-4862-bfdf-85f5ba8ed140.m3u8?test=1",
      type: "Sound",
      format: "application/x-mpegurl",
      height: 100,
      width: 100,
      duration: 268.776,
    };

    const annotationResources = [];

    const props = {
      allSources: allSources as LabeledIIIFExternalWebResource[],
      painting: painting as LabeledIIIFExternalWebResource,
      annotationResources: annotationResources as AnnotationResources,
    };

    vi.spyOn(Hls, "isSupported").mockReturnValue(true);
    const hlsSpy = vi.spyOn(Hls.prototype, "attachMedia");

    const vault = new Vault();
    await vault.loadManifest("", manifestStreaming);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeCanvas:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif/canvas/access/0",
          activeManifest:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif",
          vault,
        }}
      >
        <Player {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("player-wrapper")).toBeInTheDocument();

    // Test for the audio visualizer
    expect(screen.getByRole("presentation")).toBeInTheDocument();

    // Hls.js is now lazy-loaded via dynamic import, so attachMedia is called
    // asynchronously after the chunk resolves.
    await waitFor(() => expect(hlsSpy).toHaveBeenCalled());
  });

  it("renders the Player component for a standard audio file", async () => {
    const allSources = [
      {
        id: "https://fixtures.iiif.io/audio/indiana/mahler-symphony-3/CD1/medium/128Kbps.mp4",
        type: "Sound",
        format: "audio/mp4",
        duration: 1985.024,
      },
    ];

    const painting = {
      id: "https://fixtures.iiif.io/audio/indiana/mahler-symphony-3/CD1/medium/128Kbps.mp4",
      type: "Sound",
      format: "audio/mp4",
      duration: 1985.024,
    };

    const annotationResources = [];

    const props = {
      allSources: allSources as LabeledIIIFExternalWebResource[],
      painting: painting as LabeledIIIFExternalWebResource,
      annotationResources: annotationResources as AnnotationResources,
    };

    const vault = new Vault();
    await vault.loadManifest("", manifestSimpleAudio);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          activeCanvas:
            "https://iiif.io/api/cookbook/recipe/0002-mvm-audio/canvas",
          activeManifest:
            "https://iiif.io/api/cookbook/recipe/0002-mvm-audio/manifest.json",
          vault,
        }}
      >
        <Player {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("player-wrapper")).toBeInTheDocument();

    // Test for the audio visualizer
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  /* The `<track>` branch had no coverage: every existing test passes
     `annotationResources: []`, so none of them reach it. These render a video
     canvas whose AnnotationPage carries a mix of bodies and assert which ones
     become tracks. */
  describe("caption tracks", () => {
    const CANVAS = "https://example.org/canvas/1";

    function renderWithBodies(bodies: any[]) {
      const painting = {
        id: "https://example.org/video.mp4",
        type: "Video",
        format: "video/mp4",
        height: 720,
        width: 1280,
        duration: 27,
      };

      const annotationResources = [
        {
          id: "https://example.org/canvas/1/annotations/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/annotation/1",
              type: "Annotation",
              motivation: ["supplementing"],
              body: bodies,
              target: CANVAS,
            },
          ],
        },
      ];

      const vault = new Vault();
      vault.loadSync("", {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://example.org/manifest.json",
        type: "Manifest",
        label: { none: ["Captions"] },
        items: [
          {
            id: CANVAS,
            type: "Canvas",
            height: 720,
            width: 1280,
            duration: 27,
            items: [
              {
                id: "https://example.org/canvas/1/page/1",
                type: "AnnotationPage",
                items: [
                  {
                    id: "https://example.org/canvas/1/page/1/annotation/1",
                    type: "Annotation",
                    motivation: "painting",
                    body: painting,
                    target: CANVAS,
                  },
                ],
              },
            ],
            annotations: annotationResources,
          },
        ],
      } as any);

      const { container } = render(
        <ViewerProvider
          initialState={{
            ...defaultState,
            activeCanvas: CANVAS,
            activeManifest: "https://example.org/manifest.json",
            vault,
          }}
        >
          <Player
            allSources={[painting] as LabeledIIIFExternalWebResource[]}
            painting={painting as LabeledIIIFExternalWebResource}
            annotationResources={annotationResources as AnnotationResources}
          />
        </ViewerProvider>,
      );

      return Array.from(container.querySelectorAll("track")).map((t) =>
        t.getAttribute("src"),
      );
    }

    it("renders a track for a WebVTT resource", () => {
      expect(
        renderWithBodies([
          {
            id: "https://example.org/captions.vtt",
            type: "Text",
            format: "text/vtt",
            label: { none: ["English"] },
          },
        ]),
      ).toEqual(["https://example.org/captions.vtt"]);
    });

    it("renders a track when the format carries a charset", () => {
      expect(
        renderWithBodies([
          {
            id: "https://example.org/captions",
            type: "Text",
            format: "text/vtt; charset=utf-8",
            label: { none: ["English"] },
          },
        ]),
      ).toEqual(["https://example.org/captions"]);
    });

    /* The bug this filter exists for: an embedded body has no dereferenceable
       id, so the browser was asked to fetch `vault://<hash>` as a subtitle
       file. Two bodies with the same text share a hash, which also collided
       as a React key. */
    it("renders no track for embedded textual bodies", () => {
      expect(
        renderWithBodies([
          {
            type: "TextualBody",
            purpose: "describing",
            value: "A title card on a black ground.",
            language: "en",
          },
          {
            type: "TextualBody",
            purpose: "classifying",
            value: "title card",
            language: "en",
          },
        ]),
      ).toEqual([]);
    });

    /* Wellcome Collection publishes a PDF transcript as a supplementing body
       on a video canvas. */
    it("renders no track for a PDF transcript", () => {
      expect(
        renderWithBodies([
          {
            id: "https://example.org/transcript.pdf",
            type: "Text",
            format: "application/pdf",
            label: { none: ["PDF Transcript"] },
          },
        ]),
      ).toEqual([]);
    });

    it("keeps the caption and drops the rest when they are mixed", () => {
      expect(
        renderWithBodies([
          { type: "TextualBody", value: "A note", language: "en" },
          {
            id: "https://example.org/captions.vtt",
            type: "Text",
            format: "text/vtt",
            label: { none: ["English"] },
          },
          {
            id: "https://example.org/transcript.pdf",
            type: "Text",
            format: "application/pdf",
          },
        ]),
      ).toEqual(["https://example.org/captions.vtt"]);
    });
  });
});
