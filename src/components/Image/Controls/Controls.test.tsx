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

  /*
   * The "full-page focus restore" block is gone with the behaviour it covered.
   *
   * It asserted that Clover put focus back on the full-screen button when OpenSeadragon's
   * `full-page` event reported an exit — necessary only because `setFullPage()` reparented
   * the viewer out of the DOM and back, dropping focus on the way. Clover full-screens its
   * own root now, nothing is reparented, focus is never lost, and that event never fires.
   */
});
