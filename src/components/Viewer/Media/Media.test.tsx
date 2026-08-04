import { render, screen } from "@testing-library/react";

import { Canvas } from "@iiif/presentation-3";
import Media from "src/components/Viewer/Media/Media";
import React from "react";
import { ViewerProvider, createDefaultState } from "src/context/viewer-context";

const items = [
  {
    id: "https://example.org/manifest/1/canvas/1",
    type: "Canvas",
    height: 600,
    width: 800,
    label: { none: ["Canvas 1"] },
    thumbnail: [
      {
        id: "https://example.org/item/1/default.jpg",
        type: "Image",
        height: 75,
        width: 100,
        format: "image/jpeg",
      },
    ],
  },
  {
    id: "https://example.org/manifest/1/canvas/2",
    type: "Canvas",
    height: 600,
    width: 800,
    label: { none: ["Canvas 2"] },
    thumbnail: [
      {
        id: "https://example.org/item/2/default.jpg",
        type: "Image",
        height: 75,
        width: 100,
        format: "image/jpeg",
      },
    ],
  },
] as unknown as Canvas[];

describe("Media component", () => {
  it("renders", () => {
    render(<Media items={items} activeItem={0} />);
    const media = screen.getByTestId("media");
    expect(media);
    expect(media.hasAttribute("aria-label")).toBe(true);
    expect(media.getAttribute("data-active-canvas")).toBe(
      "https://example.org/manifest/1/canvas/1",
    );
    expect(media.getAttribute("data-canvas-length")).toBe("2");
  });

  it("renders the search toggle by default", () => {
    render(<Media items={items} activeItem={0} />);
    expect(document.querySelector(".clover-viewer-media-search")).toBeTruthy();
  });

  it("hides the search toggle when showMediaSearch is false", () => {
    const initialState = createDefaultState();
    initialState.configOptions.showMediaSearch = false;

    render(
      <ViewerProvider initialState={initialState}>
        <Media items={items} activeItem={0} />
      </ViewerProvider>,
    );

    expect(document.querySelector(".clover-viewer-media-search")).toBeNull();
  });
});
