import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CloverMap from "src/components/Map";
import React from "react";
import {
  DC_WILMETTE_GEOREF_ANNOTATION_OVERLAY,
  EXAMPLE_NAV_PLACE,
  EXAMPLE_NAV_PLACE_FEATURE,
  EXAMPLE_NAV_PLACE_POLYGON,
  GEOREF_ANNOTATION_CANVAS,
  GEOREF_ANNOTATION_IMAGE_SERVICE,
} from "src/fixtures/georef";

// ── Leaflet mock ──────────────────────────────────────────────────────────────
// Leaflet manipulates the DOM directly and can't run in jsdom without mocking.

vi.mock("leaflet", async () => {
  const circleMarker = vi.fn(() => ({
    bindPopup: vi.fn().mockReturnThis(),
    bindTooltip: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  }));

  const geoJSON = vi.fn(() => ({
    addTo: vi.fn().mockReturnThis(),
    getBounds: vi.fn(() => ({
      isValid: vi.fn().mockReturnValue(true),
      extend: vi.fn(),
    })),
    remove: vi.fn(),
  }));

  const layerGroup = vi.fn(() => ({
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn(),
  }));

  const latLngBounds = vi.fn(() => ({
    extend: vi.fn(),
    isValid: vi.fn().mockReturnValue(false),
    getNorthEast: vi.fn(() => ({ equals: vi.fn().mockReturnValue(false) })),
    getSouthWest: vi.fn(() => ({ equals: vi.fn().mockReturnValue(false) })),
    getCenter: vi.fn(() => ({ lat: 0, lng: 0 })),
  }));

  const map = vi.fn(() => ({
    getContainer: vi.fn(() => ({
      classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() },
    })),
    setView: vi.fn(),
    fitBounds: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
  }));

  const tileLayer = vi.fn(() => ({ addTo: vi.fn().mockReturnThis() }));

  const api = {
    map,
    tileLayer,
    layerGroup,
    circleMarker,
    geoJSON,
    latLngBounds,
  };

  // Expose both as named exports and as `default` so `await import("leaflet")`
  // works whether the component reads `L.map` or `L.default.map`.
  return { ...api, default: api };
});

const { WarpedMapLayer, addGeoreferenceAnnotation } = vi.hoisted(() => {
  const addGeoreferenceAnnotation = vi.fn().mockResolvedValue([]);
  const WarpedMapLayer = vi.fn(() => ({
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    addGeoreferenceAnnotation,
  }));
  return { WarpedMapLayer, addGeoreferenceAnnotation };
});

vi.mock("@allmaps/leaflet", () => ({ WarpedMapLayer }));

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
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
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

    // One WarpedMapLayer is constructed (seeded with the first annotation)…
    await vi.waitFor(() => expect(WarpedMapLayer).toHaveBeenCalledTimes(1));
    // …and the remaining annotation(s) are added to that same layer.
    await vi.waitFor(() =>
      expect(addGeoreferenceAnnotation).toHaveBeenCalledTimes(1),
    );
    expect(addGeoreferenceAnnotation).toHaveBeenCalledWith(
      DC_WILMETTE_GEOREF_ANNOTATION_OVERLAY,
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
