/**
 * Where MapLibre's worker is served from, for every map: MapLibre's own `setWorkerUrl` is
 * global, and so is this. Needed only when a bundler moves MapLibre's files (webpack, Next),
 * which breaks the relative import its worker makes; see the Map docs.
 */
let workerUrl: string | undefined;

/** Serve MapLibre's worker from `url` for every map Clover draws (a Viewer's Map tab included). */
export function setMapWorkerUrl(url: string | undefined): void {
  workerUrl = url;
}

export function getMapWorkerUrl(): string | undefined {
  return workerUrl;
}
