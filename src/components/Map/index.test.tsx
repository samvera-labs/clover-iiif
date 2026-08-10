import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CloverMap from "src/components/Map";
import React from "react";
import maplibregl from "maplibre-gl";
import {
  DC_WILMETTE_GEOREF_ANNOTATION_OVERLAY,
  EXAMPLE_NAV_PLACE,
  EXAMPLE_NAV_PLACE_FEATURE,
  EXAMPLE_NAV_PLACE_POLYGON,
  GEOREF_ANNOTATION_CANVAS,
  GEOREF_ANNOTATION_IMAGE_SERVICE,
} from "src/fixtures/georef";

// ── MapLibre GL mock ──────────────────────────────────────────────────────────
// MapLibre manipulates the DOM via WebGL and can't run in jsdom without mocking.

const { mapZoomIn, mapZoomOut } = vi.hoisted(() => ({
  mapZoomIn: vi.fn(),
  mapZoomOut: vi.fn(),
}));

vi.mock("maplibre-gl", async () => {
  const on = vi.fn((event: string, callbackOrLayerId: unknown, callback?: unknown) => {
    // Fire the 'load' event synchronously so mapReady state is set in tests
    if (event === "load") {
      const fn = typeof callbackOrLayerId === "function" ? callbackOrLayerId : callback;
      if (typeof fn === "function") (fn as () => void)();
    }
  });

  const Map = vi.fn(() => ({
    on,
    remove: vi.fn(),
    resize: vi.fn(),
    zoomIn: mapZoomIn,
    zoomOut: mapZoomOut,
    getContainer: vi.fn(() => ({
      classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() },
    })),
    getCanvas: vi.fn(() => ({ style: { cursor: "" } })),
    getLayer: vi.fn().mockReturnValue(null),
    getSource: vi.fn().mockReturnValue(null),
    addLayer: vi.fn(),
    addSource: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    fitBounds: vi.fn(),
  }));

  const Popup = vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }));

  const LngLatBounds = vi.fn(() => ({
    extend: vi.fn(),
    isEmpty: vi.fn().mockReturnValue(true),
    getNorthEast: vi.fn(() => ({ lng: 0, lat: 0 })),
    getSouthWest: vi.fn(() => ({ lng: 0, lat: 0 })),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
  }));

  const api = { Map, Popup, LngLatBounds };
  return { ...api, default: api };
});

const { WarpedMapLayer, addGeoreferenceAnnotation } = vi.hoisted(() => {
  const addGeoreferenceAnnotation = vi.fn().mockResolvedValue([]);
  const WarpedMapLayer = vi.fn(() => ({
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    setOpacity: vi.fn(),
    addGeoreferenceAnnotation,
  }));
  return { WarpedMapLayer, addGeoreferenceAnnotation };
});

vi.mock("@allmaps/maplibre", () => ({ WarpedMapLayer }));

// ── Tests ─────────────────────────────────────────────────────────────────────

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CloverMap", () => {
  it("renders the map container with the correct test id", () => {
    render(<CloverMap />);
    expect(screen.getByTestId("clover-map")).toBeInTheDocument();
  });

  it("renders with default props without throwing", () => {
    expect(() => render(<CloverMap />)).not.toThrow();
  });

  it("wires the zoom in/out buttons to the map instance, matching the OpenSeadragon controls", async () => {
    render(<CloverMap />);
    await vi.waitFor(() => expect(maplibregl.Map).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId("clover-map-zoom-in"));
    expect(mapZoomIn).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("clover-map-zoom-out"));
    expect(mapZoomOut).toHaveBeenCalledTimes(1);
  });

  it("accepts a georeference annotation with a Canvas source", () => {
    expect(() =>
      render(<CloverMap georefAnnotation={GEOREF_ANNOTATION_CANVAS} />),
    ).not.toThrow();
  });

  it("accepts the adapted ImageService annotation (for overlay)", () => {
    expect(() =>
      render(
        <CloverMap
          georefAnnotation={GEOREF_ANNOTATION_IMAGE_SERVICE}
          showImageOverlay
        />,
      ),
    ).not.toThrow();
  });

  it("accepts a navPlace FeatureCollection", () => {
    expect(() =>
      render(<CloverMap navPlace={EXAMPLE_NAV_PLACE} />),
    ).not.toThrow();
  });

  it("accepts a navPlace single Feature", () => {
    expect(() =>
      render(<CloverMap navPlace={EXAMPLE_NAV_PLACE_FEATURE} />),
    ).not.toThrow();
  });

  it("accepts a navPlace Polygon FeatureCollection", () => {
    expect(() =>
      render(<CloverMap navPlace={EXAMPLE_NAV_PLACE_POLYGON} />),
    ).not.toThrow();
  });

  it("accepts fitToData with combined navPlace + georefAnnotation", () => {
    expect(() =>
      render(
        <CloverMap
          navPlace={EXAMPLE_NAV_PLACE}
          georefAnnotation={GEOREF_ANNOTATION_CANVAS}
          fitToData
        />,
      ),
    ).not.toThrow();
  });

  it("accepts all new props together without throwing", () => {
    expect(() =>
      render(
        <CloverMap
          navPlace={EXAMPLE_NAV_PLACE}
          georefAnnotation={GEOREF_ANNOTATION_IMAGE_SERVICE}
          showControlPoints
          showImageOverlay
          imageOverlayOpacity={0.5}
          fitToData
          useCrosshairCursor
          onMapClick={vi.fn()}
          center={{ latitude: 42.045, longitude: -87.688, zoom: 12 }}
          markers={[{ latitude: 42.045, longitude: -87.688, label: "Example" }]}
          tileLayer={{
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: "&copy; OpenStreetMap contributors",
          }}
        />,
      ),
    ).not.toThrow();
  });

  it("renders without crashing when georefAnnotation has 0 GCPs (no overlay)", () => {
    const emptyAnnotation = {
      ...GEOREF_ANNOTATION_CANVAS,
      body: { type: "FeatureCollection" as const, features: [] },
    };
    expect(() =>
      render(<CloverMap georefAnnotation={emptyAnnotation} showImageOverlay />),
    ).not.toThrow();
  });

  it("renders without crashing when georefAnnotation has < 3 GCPs (no overlay)", () => {
    const twoGcpAnnotation = {
      ...GEOREF_ANNOTATION_CANVAS,
      body: {
        type: "FeatureCollection" as const,
        features: GEOREF_ANNOTATION_CANVAS.body.features.slice(0, 2),
      },
    };
    expect(() =>
      render(
        <CloverMap georefAnnotation={twoGcpAnnotation} showImageOverlay />,
      ),
    ).not.toThrow();
  });

  it("accepts multiple georef annotations via georefAnnotations", () => {
    expect(() =>
      render(
        <CloverMap
          georefAnnotations={[
            GEOREF_ANNOTATION_IMAGE_SERVICE,
            DC_WILMETTE_GEOREF_ANNOTATION_OVERLAY,
          ]}
          fitToData
        />,
      ),
    ).not.toThrow();
  });

  it("hosts multiple overlays in one warped layer (seed + add the rest)", async () => {
    const { unmount } = render(
      <CloverMap
        georefAnnotations={[
          GEOREF_ANNOTATION_IMAGE_SERVICE,
          DC_WILMETTE_GEOREF_ANNOTATION_OVERLAY,
        ]}
        showImageOverlay
        showControlPoints={false}
      />,
    );

    // One WarpedMapLayer is constructed…
    await vi.waitFor(() => expect(WarpedMapLayer).toHaveBeenCalledTimes(1));
    // …and all annotations are added to that same layer.
    await vi.waitFor(() =>
      expect(addGeoreferenceAnnotation).toHaveBeenCalledTimes(2),
    );

    unmount();
  });

  it("combines the single georefAnnotation prop with georefAnnotations", () => {
    expect(() =>
      render(
        <CloverMap
          georefAnnotation={GEOREF_ANNOTATION_IMAGE_SERVICE}
          georefAnnotations={[DC_WILMETTE_GEOREF_ANNOTATION_OVERLAY]}
          showImageOverlay
          fitToData
        />,
      ),
    ).not.toThrow();
  });
});
