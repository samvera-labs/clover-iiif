import { render, screen } from "@testing-library/react";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";
import { Vault } from "@iiif/helpers/vault";

const mockDispatch = vi.fn();

vi.mock("src/components/Viewer/InformationPanel/About/About", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-about">About</div>,
}));

// maplibre-gl uses browser APIs unavailable in jsdom; see __mocks__/maplibre-gl.ts
vi.mock("maplibre-gl");

vi.mock("@allmaps/maplibre", () => ({
  WarpedMapLayer: vi.fn(() => ({
    addGeoreferenceAnnotation: vi.fn().mockResolvedValue([]),
    setOpacity: vi.fn(),
  })),
}));

/**
 * Identities must be stable across renders. `vault` and `visibleCanvases` are
 * effect dependencies in InformationPanel, so returning fresh values on every
 * render re-triggers those effects and spins the component in a render loop.
 */
const mockState = {
  activeManifest: "https://example.org/manifest",
  collection: {},
  informationPanelResource: {},
  isAutoScrolling: false,
  isUserScrolling: false,
  vault: new Vault(),
  visibleCanvases: [],
  configOptions: {
    informationPanel: {
      enabled: true,
    },
  },
  plugins: [],
};

vi.mock("src/context/viewer-context", () => ({
  useViewerDispatch: () => mockDispatch,
  useViewerState: () => mockState,
}));

const props = {
  activeCanvas: "foobar",
  resources: [],
  setContentSearchResource: () => {},
};

describe("InformationPanel", () => {
  test("renders an element with the 'clover-viewer-information-panel' class name", () => {
    render(<InformationPanel {...props} />);
    expect(screen.getByTestId("information-panel")).toHaveClass(
      "clover-viewer-information-panel",
    );
  });
});
