import { render, screen } from "@testing-library/react";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import React from "react";
import { Vault } from "@iiif/helpers/vault";

const mockDispatch = vi.fn();

vi.mock("src/components/Viewer/InformationPanel/About/About", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-about">About</div>,
}));

// maplibre-gl uses browser APIs unavailable in jsdom
vi.mock("maplibre-gl", async () => {
  const on = vi.fn((event: string, callbackOrLayerId: unknown, callback?: unknown) => {
    if (event === "load") {
      const fn = typeof callbackOrLayerId === "function" ? callbackOrLayerId : callback;
      if (typeof fn === "function") (fn as () => void)();
    }
  });
  const Map = vi.fn(() => ({
    on, remove: vi.fn(), resize: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn(),
    getContainer: vi.fn(() => ({ classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() } })),
    getCanvas: vi.fn(() => ({ style: { cursor: "" } })),
    getLayer: vi.fn().mockReturnValue(null), getSource: vi.fn().mockReturnValue(null),
    addLayer: vi.fn(), addSource: vi.fn(), removeLayer: vi.fn(), removeSource: vi.fn(),
    setCenter: vi.fn(), setZoom: vi.fn(), fitBounds: vi.fn(),
  }));
  const Popup = vi.fn(() => ({ setLngLat: vi.fn().mockReturnThis(), setHTML: vi.fn().mockReturnThis(), addTo: vi.fn().mockReturnThis(), remove: vi.fn() }));
  const LngLatBounds = vi.fn(() => ({ extend: vi.fn(), isEmpty: vi.fn().mockReturnValue(true), getNorthEast: vi.fn(() => ({ lng: 0, lat: 0 })), getSouthWest: vi.fn(() => ({ lng: 0, lat: 0 })) }));
  const api = { Map, Popup, LngLatBounds };
  return { ...api, default: api };
});

vi.mock("@allmaps/maplibre", () => ({
  WarpedMapLayer: vi.fn(() => ({ addGeoreferenceAnnotation: vi.fn().mockResolvedValue([]), setOpacity: vi.fn() })),
}));

vi.mock("src/context/viewer-context", () => ({
  useViewerDispatch: () => mockDispatch,
  useViewerState: () => ({
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
  }),
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
