/*
 * @nulib/clover/web-components: `<clover-viewer>`, built standalone with Preact standing in
 * for React (`build/web-components.config.mjs`), for pages without React. Load it as a
 * module, or with `index.umd.js` from a classic `<script>` (a CDN):
 *
 *   <script type="module" src=".../web-components/index.mjs"></script>
 *   <clover-viewer iiif-content="https://example.org/manifest.json"></clover-viewer>
 *
 * The stylesheet comes with it; MapLibre's stylesheet and worker load only with a map.
 */
import { defineCloverViewer } from "./element";
import styles from "../styles/clover.css?inline";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

defineCloverViewer({
  styles: `@layer clover {\n${styles}\n}`,
  mapWorkerUrl,
  mapStyles: () =>
    import("maplibre-gl/dist/maplibre-gl.css?inline").then(
      (module) => module.default,
    ),
});

export { defineCloverViewer };
