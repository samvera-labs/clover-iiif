import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import Controls from "src/components/Image/Controls/Controls";
import React from "react";

describe("Controls component", () => {
  it("renders", () => {
    render(<Controls config={{}} _cloverViewerHasPlaceholder={false} />);
    const controls = screen.getByTestId(
      "clover-iiif-image-openseadragon-controls",
    );
    expect(controls);
  });

  describe("full-page focus restore", () => {
    const fullPageButtonId = "fullPage-test";

    // Fake OSD viewer exposing just enough of addHandler/removeHandler for
    // Controls to register its "full-page" listener and for the test to
    // trigger it directly.
    const createFakeViewer = () => {
      const handlers: Record<string, Array<(event: unknown) => void>> = {};
      return {
        addHandler: (name: string, handler: (event: unknown) => void) => {
          handlers[name] = handlers[name] ?? [];
          handlers[name].push(handler);
        },
        removeHandler: (name: string, handler: (event: unknown) => void) => {
          handlers[name] = (handlers[name] ?? []).filter((h) => h !== handler);
        },
        removeAllHandlers: (name: string) => {
          handlers[name] = [];
        },
        trigger: (name: string, event: unknown) => {
          (handlers[name] ?? []).forEach((handler) => handler(event));
        },
        viewport: { getRotation: () => 0 },
      };
    };

    it("focuses the full page button when full-page mode exits", () => {
      const viewer = createFakeViewer();
      document.body.innerHTML = `<button id="${fullPageButtonId}"></button>`;
      const button = document.getElementById(fullPageButtonId) as HTMLElement;

      render(
        <ViewerProvider
          initialState={{
            ...defaultState,
            openSeadragonViewer: viewer as never,
          }}
        >
          <Controls
            config={{ fullPageButton: fullPageButtonId }}
            _cloverViewerHasPlaceholder={false}
          />
        </ViewerProvider>,
      );

      viewer.trigger("full-page", { fullPage: false });

      expect(document.activeElement).toBe(button);
    });

    it("does not move focus when full-page mode is entered", () => {
      const viewer = createFakeViewer();
      document.body.innerHTML = `<button id="${fullPageButtonId}"></button>`;

      render(
        <ViewerProvider
          initialState={{
            ...defaultState,
            openSeadragonViewer: viewer as never,
          }}
        >
          <Controls
            config={{ fullPageButton: fullPageButtonId }}
            _cloverViewerHasPlaceholder={false}
          />
        </ViewerProvider>,
      );

      viewer.trigger("full-page", { fullPage: true });

      expect(document.activeElement).not.toBe(
        document.getElementById(fullPageButtonId),
      );
    });
  });
});
