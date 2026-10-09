# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/` with key modules:
  - `components/{Image,Primitives,Scroll,Slider,Viewer}`: published entry points.
  - `lib/`, `hooks/`, `context/`, `i18n/`, `web-components/`.
- Documentation site uses Next.js/Nextra in `pages/` and `docs/`.
- Build output goes to `dist/`; static assets in `public/`.
- Tests are colocated near code as `*.test.ts|tsx` (see `vitest.config.mjs`).

## Build, Test, and Development Commands

- `npm run dev`: start the docs site locally at `http://localhost:3000`.
- `npm run build`: build the library (Vite-based, writes to `dist/`).
- `npm run build:docs`: build the Next.js docs site.
- `npm run test`: run unit tests (Vitest/JSDOM).
- `npm run coverage`: run tests with coverage reports (text/json/html).
- `npm run lint`: Prettier check + `next lint`.
- `npm run typecheck`: TypeScript project checks.

## Coding Style & Naming Conventions

- Language: TypeScript + React (Next for docs; Preact for UMD WC build).
- Formatting: Prettier (semicolons enabled). Use `npm run prettier:fix` to format.
- Linting: ESLint with `next/core-web-vitals` and `@typescript-eslint` rules.
- Naming: React components in PascalCase, files `*.tsx`; utilities in camelCase `*.ts`.
- Paths: TS path aliases enabled via `vite-tsconfig-paths`.

## Testing Guidelines

- Framework: Vitest with JSDOM and Testing Library (`src/setupTests.ts`).
- Include tests alongside code: `ComponentName.test.tsx`, `util.test.ts`.
- Coverage: v8 provider; reporters text/json/html. Run `npm run coverage`.
- Prefer user-centric tests; avoid brittle DOM snapshots.

## Commit & Pull Request Guidelines

- Branch from `main`; keep PRs focused and small.
- Commits: concise, imperative (“Fix slider scroll behavior”); reference issues `#123`.
- PRs: include description, linked issues, and screenshots/GIFs for UI changes.
- Required: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` must pass.
- Update docs (`docs/` or `pages/`) when changing public APIs or behavior.

## Agents: scope of work

Agents make code changes. Committing, versioning and releasing are done by a human.

- Do not run `git commit`, `git tag`, `git push`, `npm version` or `npm publish`, and do
  not stage changes — leave the working tree for a human to review and commit.
- Do not assign a version number or edit `version` in `package.json`.
- Leave completed work as unstaged changes and describe what changed.

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

- Any change to `src/` that a consumer could notice — a prop, a default, a dependency, a
  class name, rendered output — gets an entry under `## Unreleased`.
- Write entries for the person upgrading: what changed, and what they have to do about it.
  Include a migration snippet when behavior changed.
- Add to `## Unreleased` only. Version headings and dates are added at release time by a
  human, so never convert `Unreleased` into a numbered release.
- Docs-only changes are optional, and belong under a `Documentation` heading if included.

## Map Component

- Map library: `maplibre-gl` + `@allmaps/maplibre` (replaced `leaflet` + `@allmaps/leaflet`).
- The Map is rendered as a **"Map" tab inside the InformationPanel**, not in the Painting/Canvas area. The canvas always shows the image; the map is a companion tab.
- Tab value: `"manifest-map"`. i18n key: `informationPanelTabsMap`. The tab appears only when `options.map.enabled: true` AND geographic data is present (`navPlace` or georeference annotations).
- Map data computation (`mapGeorefAnnotations`, `mapNavPlace`) lives in `InformationPanel.tsx`, not `Painting.tsx`.
- Default basemap: OpenFreeMap's Liberty vector style (`https://tiles.openfreemap.org/styles/liberty`), reshaped by `applyDefaultBasemap()` — road layers removed, hillshade added from Mapzen Terrain Tiles on AWS Open Data (`terrarium` encoding, keyless). The result is terrain + political borders + country/state names + major cities, no roads, sharp at every zoom. No free vector basemap ships terrain of its own, hence the separate DEM. CARTO Positron was the default until CARTO put their basemaps behind an API key and started serving "API KEY REQUIRED" placeholder tiles.
- `applyDefaultBasemap()` only ever runs on Clover's own default. A `styleUrl` a consumer passes is used as authored — do not strip its roads or add relief to it. `tileLayer` takes precedence over `styleUrl` and builds a raster style instead; its `referenceUrl` draws a transparent labels/borders overlay above the base, and `maxZoom`/`referenceMaxZoom` cap each source (MapLibre otherwise requests to zoom 22 and goes blank). `expandTileUrls(url)` expands the `{s}` subdomain placeholder into the array of URLs MapLibre expects.
- The hillshade is slotted before the first symbol or boundary layer so relief sits under the type rather than washing it out. Clover's own layers are added after the style loads, so navPlace geometry and markers stay above everything.
- MapLibre 6 loads its worker from a real URL resolved against its own module, so a bundler that rewrites that module breaks it — the basemap still draws but every GeoJSON layer silently vanishes. Clover bundles the worker itself and hands MapLibre a blob URL, so consumers need nothing: `scripts/build-maplibre-worker.mjs` bundles `maplibre-gl-worker.mjs` (it imports `maplibre-gl-shared.mjs` by relative path, which a blob URL cannot resolve, so it must be bundled rather than copied) into `src/components/Map/maplibre-worker.generated.ts`, which is gitignored and regenerated by `prebuild`, `prebuild:docs`, `predev`, `pretest:ci` and `pretypecheck`. Run `npm run build:maplibre-worker` by hand after bumping maplibre-gl.
- The generated worker adds ~500 KB to every bundle carrying the map, and needs `blob:` in a CSP `worker-src`. `workerUrl` / `options.map.workerUrl` is the escape hatch for a CSP that forbids blob workers, not a requirement — do not reintroduce a copy step as the default path.
- Wheel/trackpad zoom is **off** by default (`scrollZoom: false`), matching the `scrollToZoom: false` Clover sets for OpenSeadragon, so an embedded map cannot swallow page scroll. Do not re-enable it as a default.
- The accent color for markers is resolved with `resolveCloverColor()` rather than read from a token at build time: MapLibre paint properties go to WebGL, which cannot parse `var()`. It resolves once when the map becomes ready, so a token changed later will not repaint existing layers.
- Stable layer ID constants are defined at the top of `src/components/Map/index.tsx` (`NAVPLACE_SOURCE`, `WARPED_LAYER_ID`, etc.).
- MapLibre feature properties with nested objects (`iiifResource`, `label`, `summary`) are JSON-stringified in event handlers; use `parseMaplibreFeature()` to re-parse them.
- Tests must mock `maplibre-gl` and `@allmaps/maplibre` in any test file that imports a component which (transitively) imports Map — including `InformationPanel.test.tsx`. The mock fires the `load` event synchronously.
- `Map` is a composable standalone component, just as `Image` is. The Viewer wraps both — but consumers can use `Map` directly outside the Viewer. Keep this composability in mind when changing either component's props or internals.

## Canvas Component (experimental)

- `Canvas` (`src/components/Canvas/`, package export `./canvas`) is Clover's own **2D**
  renderer, an experiment toward replacing OpenSeadragon (images) and Vidstack (A/V). It is
  2D only. 3D (IIIF Presentation 4 Scenes) is reserved for a future, separate `Scene`
  component, so do not add 3D abstractions such as 4×4 matrices or perspective cameras.
- The renderer core is framework-free in `src/lib/renderer/`. `CanvasRenderer` owns the
  camera (`camera/`), frame loop (`loop/`), input (`input/`), loading (`io/`) and painters
  (`backends/`). The React component is a thin host.
- Painters sit behind one `Backend` interface. WebGL2 is primary and Canvas2D is a
  full-fidelity fallback. `DomLayers` positions real `<img>`/`<video>` elements with the same
  camera transform.
- Cross-origin pixels without CORS cannot be uploaded to WebGL. They are shown as a DOM
  layer, decided **per item, never per instance**.
- World units are the first image's own pixels (its declared IIIF `width`/`height` when
  known), so `getBounds()` is directly an `xywh=` region.
- Image services: `sources/imageService.ts` parses `info.json` for 3.0, 2.1.1 and 2.0 and
  spells **canonical** request URLs. A level 0 static tree answers to nothing else, which
  is also why a tile covering the whole image uses the region `full`.
  `sources/tilePyramid.ts` builds levels from `tiles`, from `sizes`, or from tiles Clover
  derives itself.
- Each frame is decided by `scene/planFrame.ts`, which is pure. `io/TileCache.ts` follows
  its required set: abort on supersede, a priority window, one retry, a negative cache,
  and a byte LRU. Tiles are keyed by URL and shared across items.
- Controls render `Image/Controls/ControlCluster.tsx`, the presentational half of
  `Image`'s controls, with click handlers. Do not import `viewer-context` into Canvas:
  it adds about 21 kB gzip. Viewer concerns (`controlButtons`, plugins, active
  annotation) come in as props. Labels come from `useCloverTranslation`, as in `Image`.
- `Canvas` draws the IIIF Canvases it is handed (`canvases`) and nothing Manifest-level.
  It has no stepper, no `behavior`, and no Manifest fetching: which Canvases to show,
  and moving between them, is the host's job.
  - `src/components/Canvas/layout.ts` is pure. Its painted images are scaled into each
    annotation's `#xywh=` target. Several Canvases are laid along the `viewingDirection`
    axis at a common height (in a row) or width (in a column). World units are Canvas
    coordinates.
  - For hosts, `src/lib/iiif-sequence.ts` groups a Manifest into views by `behavior`.
    `paged` must match `@iiif/helpers`' `getManifestSequence`, which the Viewer uses.
- Chrome follows the Player: `useChromeVisibility` sets `data-chrome="visible"` on pointer
  activity, with a `hideDelay` timeout. CSS also shows the chrome on keyboard focus
  (`:has(:focus-visible)`), which is required. The media transport uses the same hook. `Choice` selection is Canvas-level state
  (`findChoices` / `ChoiceSelections` in `layout.ts`), not the host's.
- Video and sound live in `src/components/Canvas/media/`. `MediaStage` is `React.lazy`,
  so its code loads only when a Canvas paints media. Its CSS still ships with the entry,
  as every package's CSS is injected there.
  - `useMediaElement` makes the `<video>` imperatively. The renderer moves it into its
    DOM layer, so React must not own it. Sound plays through a `<video>` too, never
    placed in the scene.
  - A video is a `SceneImage` with `media: { element, presentation }`. `dom` (the
    default) positions the real element. `texture` uploads frames with `texImage2D`,
    once per `requestVideoFrameCallback` frame. Do not switch to `texSubImage2D`: from
    a video it uploads black in Chrome.
  - Only `texture` asks for CORS. If the CORS load fails outright, the element is
    remade without it and presented as `dom`. This also covers a cached non-CORS copy
    of the same URL.
  - Captions are fetched with CORS and handed to `<track>` as blob URLs, because a
    cross-origin track is refused on a video without `crossorigin`. Tracks stay
    `hidden`; Clover draws the active cues itself.
  - `useMediaController` is the headless state; `Transport.tsx` is native range inputs
    and buttons styled as the Player's bar. Sound has no waveform in Canvas: do not
    import the Player's `Waveform` (or `wavesurfer.js`, or `@vidstack/react`).
  - With media, `clickToZoom` is off and a click (renderer `"tap"`) plays and pauses.
  - A lone media Canvas (`canvases.length === 1`) is always fitted: `navigable: false`
    on the gestures, `fit: true` on every `setImages`, and the world is the video's rect
    at its intrinsic aspect (`containAspect`). It has no top cluster, scrim or
    navigator; full screen is the last button in the transport. The cluster returns only
    to offer a `Choice`.
  - The transport fades with the rest of the chrome, through the single reveal rule
    in `Canvas.css`. Do not add "stay visible while paused" or similar overrides. The
    reveal is `data-chrome` (pointer, from `useChromeVisibility`, lingering
    `LEAVE_DELAY` after leave or blur) or `:has(:focus-visible)`. It is not
    `:focus-within`: a click focuses the viewport and would pin a video's bar.
- Fixtures: `src/fixtures/iiif-image/info.ts` holds the reference server's Göttingen
  `info.json` for 3.0, 2.1 and 2.0, which is the image in Cookbook recipe 0005. The
  Cookbook recipes the layout tests use are in `src/fixtures/iiif-cookbook/`.
- Draws happen only in `requestAnimationFrame` and on demand. A hidden tab or preview pane
  never fires rAF, so verify rendering in a visible browser or headless Playwright.
- It is not yet exported from the package root or wired into the Viewer. The plan is
  `options.renderer: "openseadragon" | "canvas"`, with OpenSeadragon remaining the default.
- When `Canvas` is merged into the Viewer, the Sound waveform goes altogether: delete
  `Viewer/Player/Custom/Waveform.tsx` and its helpers (`HlsAudioBars`,
  `useProgressivePeaks`, `waveformStyle`, `audioSource`) and drop the `wavesurfer.js`
  dependency. Until then, leave the Player's waveform as it is.

## i18n

- Clover translates with its own small translator in `src/i18n/config.ts`. No i18next:
  it was about 20 kB gzip, and Clover used only key lookup, `{{name}}` interpolation,
  fallback and detection.
- Resources keep i18next's shape, `resources[lng][namespace][key]`, with the `clover`
  namespace, so `initCloverI18n({ lng, fallbackLng, resources })` is unchanged for
  consumers.
- Lookup order: the set `lng`, or else the browser's languages and then `<html lang>`.
  After that come `fallbackLng`, and English last. Each regional tag also tries its base
  language (`pt-BR` → `pt`).
- Components call `useCloverTranslation()` and use only `t`. It re-renders through
  `useSyncExternalStore` when `initCloverI18n` changes the language or the strings.
- Add a locale by adding `src/i18n/locales/<tag>.json` and listing it in
  `src/i18n/locales/index.ts`. All locales are bundled, which is about 2.5 kB gzip.

## Environment & Tooling

- Node: `20.5.0` (see `.tool-versions`).
- Husky/lint-staged run formatting and lint checks on commit.
- When working with IIIF resources, verify CORS in local examples.
