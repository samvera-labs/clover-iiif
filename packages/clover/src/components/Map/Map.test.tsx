import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import {
  DC_GEOREF_ANNOTATION_CANVAS,
  DC_IMAGE_SERVICE_V3_ID,
  evanston,
} from "../../fixtures/georef";
import canvasesJson from "../../fixtures/iiif-cookbook/0240-navPlace-on-canvases.json";
import { initCloverI18n } from "../../i18n";
import * as Clover from "../../index";
import { Map as CloverMap } from "../../map";

/** A MapLibre that records what is asked of it, and loads at once. */
const maps: FakeMap[] = [];
let failNext = false;

class FakeMap {
  options: any;
  sources: Record<string, any> = {};
  layers: Array<{ id: string; type: string; source?: string }> = [];
  handlers: Array<{ event: string; layer?: string; fn: (e: any) => void }> = [];
  fitBounds = vi.fn();
  jumpTo = vi.fn();
  setPaintProperty = vi.fn();
  constructor(options: any) {
    if (failNext) {
      failNext = false;
      throw new Error("WebGL is not available");
    }
    this.options = options;
    maps.push(this);
    queueMicrotask(() => this.fire("load", {}));
  }
  on(event: string, layer: any, fn?: any) {
    if (typeof layer === "function") this.handlers.push({ event, fn: layer });
    else this.handlers.push({ event, layer, fn });
  }
  fire(event: string, payload: any, layer?: string) {
    this.handlers
      .filter((h) => h.event === event && h.layer === layer)
      .forEach((h) => h.fn(payload));
  }
  getStyle() {
    return { layers: [{ id: "road-primary", type: "line" }] };
  }
  addSource(id: string, spec: any) {
    this.sources[id] = { ...spec, setData: vi.fn() };
  }
  getSource(id: string) {
    return this.sources[id];
  }
  removeSource(id: string) {
    delete this.sources[id];
  }
  addLayer(layer: any) {
    this.layers.push(layer);
  }
  getLayer(id: string) {
    return this.layers.find((layer) => layer.id === id);
  }
  removeLayer(id: string) {
    this.layers = this.layers.filter((layer) => layer.id !== id);
  }
  addControl() {}
  getCanvas() {
    return { style: {} as Record<string, string> };
  }
  resize() {}
  remove() {}
}

const popups: Array<{ text?: string }> = [];
class FakePopup {
  text?: string;
  setLngLat() {
    return this;
  }
  setText(text: string) {
    this.text = text;
    return this;
  }
  addTo() {
    popups.push(this);
    return this;
  }
}

vi.mock("maplibre-gl", () => ({
  Map: FakeMap,
  Popup: FakePopup,
  NavigationControl: class {},
  setWorkerUrl: vi.fn(),
}));

// jsdom has no 2D canvas, and loads no images: give the overlay both.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => ({
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    clip() {},
    drawImage() {},
  })) as never;
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    set(this: HTMLImageElement) {
      Object.defineProperty(this, "naturalWidth", { value: 1528 });
      Object.defineProperty(this, "naturalHeight", { value: 2048 });
      queueMicrotask(() => this.onload?.(new Event("load")));
    },
  });
});

beforeEach(() => {
  initCloverI18n({ lng: "en" });
  maps.length = 0;
  popups.length = 0;
});

const placeData = (map: FakeMap) =>
  map.sources["geomap-navplace"].setData.mock.calls.at(-1)?.[0];

describe("Map", () => {
  it("draws GeoJSON it is given, framed on its one point", async () => {
    render(
      <CloverMap
        navPlace={{
          type: "Feature",
          properties: { label: { en: ["Evanston"] } },
          geometry: { type: "Point", coordinates: [-87.69, 42.04] },
        }}
      />,
    );
    await waitFor(() => expect(maps).toHaveLength(1));
    const [map] = maps;
    await waitFor(() => expect(placeData(map)?.features).toHaveLength(1));
    expect(placeData(map).features[0].properties.title).toBe("Evanston");
    expect(map.jumpTo).toHaveBeenCalledWith({
      center: [-87.69, 42.04],
      zoom: 8,
    });
    // Wheel zoom stays off, and the default basemap loses its roads.
    expect(map.options.scrollZoom).toBe(false);
    expect(map.getLayer("road-primary")).toBeUndefined();
  });

  it("maps a Root's places; pressing one names it and opens its Canvas", async () => {
    render(
      <Clover.Root iiifContent={canvasesJson}>
        <Clover.Label of="canvas" data-testid="canvas" />
        <CloverMap />
      </Clover.Root>,
    );
    await waitFor(() => expect(maps).toHaveLength(1));
    const [map] = maps;
    await waitFor(() => expect(placeData(map)?.features).toHaveLength(2));
    expect(map.fitBounds).toHaveBeenCalled();

    const second = placeData(map).features[1];
    act(() =>
      map.fire(
        "click",
        { features: [second], lngLat: { lng: 0, lat: 0 } },
        "geomap-navplace-point",
      ),
    );
    expect(popups.at(-1)?.text).toBe("Current Location of Painting");
    await waitFor(() =>
      expect(screen.getByTestId("canvas")).toHaveTextContent(
        canvasesJson.items[1].label.en[0],
      ),
    );
  });

  it("warps a georeferenced image onto the map by its control points", async () => {
    render(<CloverMap georeferences={[georeferenceOnService()]} />);
    await waitFor(() => expect(maps).toHaveLength(1));
    const [map] = maps;
    await waitFor(() =>
      expect(
        Object.values(map.sources).find((source) => source.type === "canvas"),
      ).toBeTruthy(),
    );
    const overlay = Object.values(map.sources).find(
      (source) => source.type === "canvas",
    );
    expect(overlay.coordinates).toHaveLength(4);
    for (const [lng, lat] of overlay.coordinates) {
      expect(lng).toBeGreaterThan(-88);
      expect(lng).toBeLessThan(-87.5);
      expect(lat).toBeGreaterThan(41.9);
      expect(lat).toBeLessThan(42.2);
    }
    // Drawn as a raster layer, under the places.
    const raster = map.layers.findIndex((l) => l.type === "raster");
    expect(raster).toBeGreaterThanOrEqual(0);
    expect(map.fitBounds).toHaveBeenCalled();
  });

  it("overlays the view's georeferenced Canvas inside a Root", async () => {
    render(
      <Clover.Root iiifContent={evanston()}>
        <CloverMap />
      </Clover.Root>,
    );
    await waitFor(() => expect(maps).toHaveLength(1));
    await waitFor(() =>
      expect(
        Object.values(maps[0].sources).some((s) => s.type === "canvas"),
      ).toBe(true),
    );
  });

  it("says so when MapLibre cannot start (no WebGL)", async () => {
    failNext = true;
    render(<CloverMap navPlace={{ type: "Point", coordinates: [0, 0] }} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The map could not be shown.",
    );
  });
});

describe("the Map tab", () => {
  it("is offered by itself when the Manifest has places, and not otherwise", async () => {
    const { unmount } = render(
      <Clover.Root
        iiifContent={{
          ...canvasesJson,
          // The same Canvases, their navPlace taken away.
          items: canvasesJson.items.map((canvas) => ({
            ...canvas,
            navPlace: undefined,
          })),
        }}
      >
        <Clover.InformationPanel />
      </Clover.Root>,
    );
    await screen.findByRole("tab", { name: "About" });
    expect(screen.queryByRole("tab", { name: "Map" })).toBeNull();
    unmount();

    render(
      <Clover.Root iiifContent={canvasesJson}>
        <Clover.InformationPanel />
      </Clover.Root>,
    );
    expect(await screen.findByRole("tab", { name: "Map" })).toBeInTheDocument();
  });
});

function georeferenceOnService() {
  return {
    ...DC_GEOREF_ANNOTATION_CANVAS,
    target: {
      ...DC_GEOREF_ANNOTATION_CANVAS.target,
      source: {
        id: DC_IMAGE_SERVICE_V3_ID,
        type: "ImageService3",
        profile: "level2",
        width: 7337,
        height: 9833,
      },
    },
  };
}
