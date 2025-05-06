import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AnnotationResources } from "src/types/annotations";
import Hls from "hls.js";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import Player from "src/components/Viewer/Player/Player";
import React from "react";
import { Vault } from "@iiif/helpers/vault";
import { ViewerProvider } from "src/context/viewer-context";
import manifestSimpleAudio from "src/fixtures/viewer/player/manifest-simple-audio.json";
import manifestStreaming from "src/fixtures/viewer/player/manifest-streaming-audio.json";

describe("Player component", () => {
  let originalLoad: any;

  beforeAll(() => {
    originalLoad = window.HTMLMediaElement.prototype.load;
    window.HTMLMediaElement.prototype.load = () => {
      /* do nothing */
    };
  });

  afterAll(() => {
    window.HTMLMediaElement.prototype.load = originalLoad;
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
          activeCanvas:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif/canvas/access/0",
          activeManifest:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif",
          collection: {},
          configOptions: {},
          customDisplays: [],
          plugins: [],
          isInformationOpen: false,
          isLoaded: false,
          vault,
          openSeadragonViewer: null,
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

    const hlsSpy = vi.spyOn(Hls.prototype, "attachMedia");

    const vault = new Vault();
    await vault.loadManifest("", manifestStreaming);

    render(
      <ViewerProvider
        initialState={{
          activeCanvas:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif/canvas/access/0",
          activeManifest:
            "https://dcapi.rdc-staging.library.northwestern.edu/api/v2/works/d2a423b1-6b5e-45cb-9956-46a99cd62cfd?as=iiif",
          collection: {},
          configOptions: {},
          customDisplays: [],
          plugins: [],
          isInformationOpen: false,
          isLoaded: false,
          vault,
          openSeadragonViewer: null,
        }}
      >
        <Player {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("player-wrapper")).toBeInTheDocument();

    // Test for the audio visualizer
    expect(screen.getByRole("presentation")).toBeInTheDocument();

    // Test for Hls Attach
    expect(hlsSpy).toHaveBeenCalled();
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
          activeCanvas:
            "https://iiif.io/api/cookbook/recipe/0002-mvm-audio/canvas",
          activeManifest:
            "https://iiif.io/api/cookbook/recipe/0002-mvm-audio/manifest.json",
          collection: {},
          configOptions: {},
          customDisplays: [],
          plugins: [],
          isInformationOpen: false,
          isLoaded: false,
          vault,
          openSeadragonViewer: null,
        }}
      >
        <Player {...props} />
      </ViewerProvider>,
    );

    expect(screen.getByTestId("player-wrapper")).toBeInTheDocument();

    // Test for the audio visualizer
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });
});
