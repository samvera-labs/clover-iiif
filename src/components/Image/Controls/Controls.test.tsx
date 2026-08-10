import { ViewerProvider, defaultState } from "src/context/viewer-context";
import { render, screen } from "@testing-library/react";

import Controls from "src/components/Image/Controls/Controls";
import type { ControlButtonProps } from "src/context/viewer-context";
import React from "react";

const CustomZoomIn = ({ buttonProps, icon }: ControlButtonProps) => (
  <button {...buttonProps} data-testid="custom-zoom-in">
    {icon}
  </button>
);

const config = {
  showZoomControl: true,
  zoomInButton: "zoomIn-abc",
  zoomOutButton: "zoomOut-abc",
};

const renderControls = (
  controlButtons?: Record<string, unknown>,
  overrides = {},
) =>
  render(
    <ViewerProvider
      initialState={{
        ...defaultState,
        configOptions: { ...defaultState.configOptions, controlButtons },
      }}
    >
      <Controls
        config={{ ...config, ...overrides }}
        _cloverViewerHasPlaceholder={false}
      />
    </ViewerProvider>,
  );

describe("Controls component", () => {
  it("renders", () => {
    render(<Controls config={{}} _cloverViewerHasPlaceholder={false} />);
    expect(screen.getByTestId("clover-iiif-image-openseadragon-controls"));
  });
});

describe("Controls component with controlButtons", () => {
  it("replaces a control with the configured component", () => {
    renderControls({ zoomIn: CustomZoomIn });

    const custom = screen.getByTestId("custom-zoom-in");
    // OpenSeadragon binds by element id, so a replacement has to keep it.
    expect(custom.getAttribute("id")).toBe("zoomIn-abc");
    expect(custom.getAttribute("aria-label")).toBe("Zoom in");
  });

  it("keeps the default button for controls without a replacement", () => {
    renderControls({ zoomIn: CustomZoomIn });

    const defaults = screen.getAllByTestId("openseadragon-button");
    expect(defaults).toHaveLength(1);
    expect(defaults[0].getAttribute("id")).toBe("zoomOut-abc");
  });

  it("renders every default when no replacement is configured", () => {
    renderControls();

    expect(screen.queryByTestId("custom-zoom-in")).toBeNull();
    expect(screen.getAllByTestId("openseadragon-button")).toHaveLength(2);
  });

  it("does not render a replacement for a control hidden by its flag", () => {
    renderControls({ zoomIn: CustomZoomIn }, { showZoomControl: false });

    expect(screen.queryByTestId("custom-zoom-in")).toBeNull();
  });

  it("accepts a memoised component", () => {
    renderControls({ zoomIn: React.memo(CustomZoomIn) });

    expect(screen.getByTestId("custom-zoom-in").getAttribute("id")).toBe(
      "zoomIn-abc",
    );
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
