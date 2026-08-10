/**
 * MapLibre GL draws through WebGL and cannot run under jsdom, so tests use this
 * stub instead of the real package.
 *
 * It lives here rather than in a per-file `vi.mock(…, factory)` because CloverMap
 * acquires MapLibre with a dynamic `import("maplibre-gl")` inside an effect, and
 * maplibre-gl ships CJS only (no `exports`/`module` field). A factory mock is not
 * reliably in place before that first import resolves, which let the real bundle
 * load and throw on `window.URL.createObjectURL`. A `__mocks__` module adjacent to
 * node_modules is registered up front, so the dynamic import always gets the stub.
 */

/**
 * Every method is a spy, so a test can assert against a given instance with
 * `vi.mocked(maplibregl.Map).mock.results.at(-1)?.value`.
 */
export const Map = vi.fn(() => ({
  // Fire `load` synchronously so the component's `mapReady` state is set.
  on: vi.fn((event: string, callbackOrLayerId: unknown, callback?: unknown) => {
    if (event !== "load") return;
    const handler =
      typeof callbackOrLayerId === "function" ? callbackOrLayerId : callback;
    if (typeof handler === "function") (handler as () => void)();
  }),
  addLayer: vi.fn(),
  addSource: vi.fn(),
  fitBounds: vi.fn(),
  getCanvas: vi.fn(() => ({ style: { cursor: "" } })),
  getContainer: vi.fn(() => ({
    classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() },
  })),
  getLayer: vi.fn().mockReturnValue(null),
  getSource: vi.fn().mockReturnValue(null),
  remove: vi.fn(),
  removeLayer: vi.fn(),
  removeSource: vi.fn(),
  resize: vi.fn(),
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
}));

export const Popup = vi.fn(() => ({
  setLngLat: vi.fn().mockReturnThis(),
  setHTML: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
}));

export const LngLatBounds = vi.fn(() => ({
  extend: vi.fn(),
  isEmpty: vi.fn().mockReturnValue(true),
  getNorthEast: vi.fn(() => ({ lng: 0, lat: 0 })),
  getSouthWest: vi.fn(() => ({ lng: 0, lat: 0 })),
  getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
}));

/** CloverMap reads the default export: `const { default: ml } = await import(…)`. */
export default { Map, Popup, LngLatBounds };
