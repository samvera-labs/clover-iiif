/*
 * @nulib/clover/map: where IIIF resources are, on a map. A navPlace layer (Collection,
 * Manifest, Canvas and annotation) and georeferenced images, warped by their control
 * points. In the same module graph as `@nulib/clover`, so a `Map` inside a `Clover.Root`
 * maps the Root's resource and follows its view.
 *
 * MapLibre GL is loaded when a map is first shown; importing this entry loads none of it.
 * A Viewer's Map tab needs no import of this entry: it appears by itself. Import
 * MapLibre's stylesheet beside Clover's:
 *
 *   import { Map } from "@nulib/clover/map";
 *   import "maplibre-gl/dist/maplibre-gl.css";
 */

export { CloverMap as Map } from "../components/Map/Map";
export type { MapProps } from "../components/Map/Map";
export { setMapWorkerUrl } from "../core/map-config";
export {
  affineTransform,
  boundsOf,
  cornersOf,
  georeferencesOf,
  hasMapData,
  navPlaceOf,
  readGeoreference,
} from "../core/geo";
export type {
  Georeference,
  MapFeature,
  MapFeatureCollection,
} from "../core/geo";
