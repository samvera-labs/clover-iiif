import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import Painting from "./Painting";
import React from "react";
import { Vault } from "@iiif/vault";
import { canvasWithPDFs } from "src/fixtures/viewer/custom-display/manifest-complex";
import { manifestImage } from "src/fixtures/viewer/manifest-image";
import { manifestVideo } from "src/fixtures/viewer/manifest-video";

const painting: Array<LabeledIIIFExternalWebResource> = [
  {
    format: "image/tiff",
    height: 5792,
    id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705/full/600,/0/default.jpg",
    service: [
      {
        id: "https://iiif.dc.library.northwestern.edu/iiif/2/e549a0f6-e4f4-4629-b6e2-f5c434189705",
        "@type": "ImageService2",
        profile: "http://iiif.io/api/image/2/level2.json",
      },
    ],
    type: "Image",
    width: 8688,
  },
];

const defaultProps = {
  activeCanvas:
    "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/1",
  isMedia: false,
  painting,
  resources: [],
};

// Mock child components
vi.mock("src/components/Viewer/Player/Player", () => ({
  default: () => {
    return <div data-testid="mock-player">Player</div>;
  },
}));
vi.mock("src/components/Viewer/ImageViewer/ImageViewer", () => ({
  default: () => {
    return <div data-testid="mock-image-viewer">ImageViewer</div>;
  },
}));
vi.mock("src/components/Viewer/Painting/Placeholder", () => ({
  default: () => {
    return <div data-testid="painting-placeholder">Placeholder</div>;
  },
}));
vi.mock("src/components/Viewer/Painting/Toggle", () => ({
  default: () => {
    return <div data-testid="placeholder-toggle">Placeholder</div>;
  },
}));

describe("Painting component", () => {
  const vault = new Vault();

  it("renders the Placeholder and toggle button when a placeholder canvas is present and its not a media file", async () => {
    await vault.loadManifest("", canvasWithPDFs);

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...defaultProps} />
      </ViewerProvider>,
    );
    expect(screen.getByTestId("placeholder-toggle"));
    expect(screen.getByTestId("painting-placeholder"));
  });

  it("Bypasses the Placeholder toggle and image items as expected", async () => {
    await vault.loadManifest("", canvasWithPDFs);

    const props = {
      ...defaultProps,
      activeCanvas:
        "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );
    expect(screen.queryByTestId("placeholder-toggle")).toBeNull();
  });

  it("displays the default Video viewer for Media files", async () => {
    await vault.loadManifest("", manifestVideo);

    const props = {
      ...defaultProps,
      activeCanvas:
        "https://api.dc.library.northwestern.edu/api/v2/works/ec1a0e4f-d0e1-4bc3-9037-9d53e679522f?as=iiif/canvas/access/0",
      isMedia: true,
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(screen.queryByTestId("placeholder-toggle")).toBeNull();
    expect(screen.getByTestId("mock-player")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-image-viewer")).not.toBeInTheDocument();
  });

  it("displays the default Image viewer for non-media files", async () => {
    await vault.loadManifest("", manifestImage);

    const props = {
      ...defaultProps,
      activeCanvas:
        "https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif/canvas/access/2",
    };

    render(
      <ViewerProvider
        initialState={{
          ...defaultState,
          vault,
        }}
      >
        <Painting {...props} />
      </ViewerProvider>,
    );

    expect(screen.queryByTestId("placeholder-toggle")).toBeNull();
    expect(screen.queryByTestId("mock-player")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-image-viewer")).toBeInTheDocument();
  });

  it.skip("renders the Choice select dropdown", () => {
    render(<Painting {...defaultProps} />);
    expect(screen.queryByTestId("choice-select")).toBeNull();
  });
});
