# @nulib/clover

The composable 4.x Clover: parts with dot notation around one `Clover.Root`, plus a
ready-made `Clover.Viewer` built only from those parts. It is an npm workspace of the
repository, private and unpublished. `@samvera/clover-iiif` (the repository root) is the
3.x line and is maintained separately.

The root `AGENTS.md` applies here too, including the agents' scope of work: no commits,
staging, `git mv`, versions or publishing.

## Package rules

- **Relative imports only.** Nothing in `src/` imports `src/...`, `docs/...` or
  `@samvera/clover-iiif`; ESLint forbids it. The Vite build throws on any bare import that
  is not a declared dependency or peer, so OpenSeadragon, Radix and the like cannot slip
  in. Code copied from 3.x (fullscreen, label, hls, i18n, the control cluster) is copied on
  purpose, and the copies may drift.
- **Dependencies:** peers `react` and `react-dom` (18 or 19). Dependencies are
  `@iiif/parser@4` (the Presentation 4 upgrader, loaded on demand, and P4 types),
  `@iiif/helpers@4` (`i18n` only, 0.6 kB), `@iiif/presentation-3` (types), and
  `dompurify`, `hls.js` and `maplibre-gl`, all loaded on demand. 3.x keeps parser 2 and helpers 1.5 at
  the root; npm nests the package's own copies under `packages/clover/node_modules`. No
  Vault: it is 19.5 kB gzip. Add a dependency only when a milestone needs it.
- **ES modules only**, one file per source module (`preserveModules`), named exports
  only. `import * as Clover from "@nulib/clover"` gives dot notation and still
  tree-shakes; `build/consumer.test.mjs` asserts that. Never an aggregate object or
  `Root.Item = …` statics. A CommonJS build beside it would let an app load two copies and
  split the React context the parts share.
- **Styles:** colocated `.css` files, listed by hand in `src/styles/clover.css` and built
  into `dist/styles.css` (esbuild), which `build/styles.mjs` wraps in `@layer clover`.
  Keep the aggregate's imports plain: the docs import it from source, and Next 14 reads
  `@import … layer()` as a media query that never matches. Package JS never imports CSS.
  Tokens are `--clover-*` with literal fallbacks. Add every new stylesheet to the list.
- **Plain-layout scaffolding.** Every part must still lay out plainly without the
  stylesheet: semantic HTML in reading order, SVG icons with `width`/`height`
  attributes, and the few functional styles inline (stage position and height, track
  overflow, visually hidden text, `hidden` on closed popovers). Everything visual goes in
  the stylesheet. The Canvas's figure, viewport, surface and DOM layers set their geometry
  inline. Without it, WebKit grows the canvas without bound. `e2e/specs/plain.spec.ts`
  checks this layout in every engine.
- **Full screen** is offered only where `isFullscreenSupported()` says an element can have
  it. Read it with `useFullscreenSupported()`, which assumes support on the server, so
  hydration matches. Where elements cannot go full screen (iPhone), a video goes to the
  system player: pass it to `toggleFullscreen(from, video)`. A `texture` video is not on
  the page, so it is placed first in its Canvas at full size, under the viewport, until
  `webkitendfullscreen`. The player is handed it a frame later. Handed over at once, a
  video that has never been laid out shows as black. Safari still honours the press.
  Checked in the iOS 26 Simulator.
- **Class names** are `clover-*`, and never one 3.x uses: both stylesheets load on the
  docs pages, and an app moving to 4.x may load both too. The Viewer's are
  `clover-layout*`, not `clover-viewer*`. Before adding a class, grep `src/` for it. Copied 3.x classes were renamed (`clover-canvas-controls`,
  `clover-canvas-button`, `clover-canvas-exit-full-screen`, `clover-canvas-error`), so 3.x
  and 4.x styles never collide on one page.

## Templates

- `src/templates/<name>/` holds a ready-made layout: `<Name>.tsx`, `<Name>.css` and a
  `README.md` (the docs page imports the README, so it is the documentation). Templates
  are a second entry, `@nulib/clover/templates`, in the same module graph, with their
  own stylesheet, `@nulib/clover/templates.css` (`src/templates/templates.css`).
- A template imports only `react`, `../../index` (the public API) and
  `../shared/…`; `templates.test.tsx` enforces it, so any template can be copied into an
  app as it is. If a template needs something, export it from the package first.
- Classes are `clover-template-<name>-*`.
- Current set: `Classic` (3.x Viewer layout), `Document` (a PDF viewer: thumbnails left,
  one whole page at a time, the panel sliding out right), `Gallery` (grid and lightbox),
  `Text` (3.x Scroll: an article per Canvas, text by language; it sets
  `annotationPages="all"`).
- `Document` turns pages from the wheel in `document/usePaging.ts`: one gesture is one
  page (a new gesture after a 160 ms pause, a swing harder than the momentum, or a strong
  event 600 ms after the last turn), and the wheel passes through at either end. It
  relies on the Canvas leaving a plain wheel alone (`scrollToZoom: false`); if that
  default changes, the template must claim the wheel first. A turn only changes which
  Canvas the one `Content` shows; the renderer swaps it in place and frames it at once.
  Do not animate the stage, key it, or remount the Canvas on a turn (Mat: it should
  simply swap the content). The panel slides with
  `useSlide` (`hidden` once out of sight, so it reads plainly without CSS).
- **Closing the information panel** is `InformationPanel`'s job, not a template's: pass
  `onClose` (a close button, and focus handed back to the `aria-controls` control) and,
  only for a panel floating over the page, `closeOnEscape`. A docked panel (Viewer,
  Classic) does not close on Escape. A floating one (Document) also takes focus when it
  opens. Any new layout with a panel does the same. `shared/Lightbox.tsx` is a native `<dialog>`; jsdom lacks
  `showModal()`, so tests polyfill it.

## Build and test

- `npm run build -w @nulib/clover` builds `dist/` (Vite with three entries: the parts,
  `templates/index` and `map/index`; then `build/styles.mjs` for `styles.css` and
  `templates.css`, then `dts-bundle-generator` for each entry's `.d.mts`). The root `npm run build` runs it after
  the 3.x build.
- `npm run test -w @nulib/clover`, or the root `npm test`, which runs both Vitest
  projects (`vitest.workspace.mjs`).
- `npm run test:build -w @nulib/clover` checks the built package, so build first.
  `build/bundle.test.mjs` checks the emitted graph (three entries, only package source,
  externals within dependencies and peers, a forbidden list, lazy modules) and the size a
  consumer ships against `build/size-budget.json`. Raise a budget only on purpose, and
  say so in the changelog.
- The docs import `@nulib/clover`, `@nulib/clover/templates`, `@nulib/clover/map` and the
  stylesheets, which the root `tsconfig.json` maps to this package's source. Its demos live under `pages/docs/4.x/`.

### End to end (`e2e/`)

- `npm run e2e -w @nulib/clover` runs Playwright (`e2e/playwright.config.ts`) over a Vite
  harness of the package's source (`e2e/app`, port 4321). The projects are chromium,
  webkit, firefox, `iphone` (WebKit at iPhone 15 size, with touch) and `react19`.
  `react19` runs Chromium against a second server on port 4322. That server aliases React
  to `e2e/react19/node_modules`, which is its own install, so run `npm ci` there once.
- The harness picks a scene by query: `?scene=viewer|items|classic|document|composed`,
  `&content=`, `&css=0` (no stylesheet, the plain layout) and `&headers=1` (request
  settings). `composed` puts the viewport channel on `window.__viewport`, for gesture
  specs.
- `specs/fixtures.ts` serves everything from disk, so nothing reaches the network:
  - Cookbook fixtures as `https://fixtures.test/<name>.json`, with the request's Origin
    echoed so credentials work.
  - `generated/<n>.json`, a Manifest of n Canvases.
  - Every image service as a tiled 4096 px level 0 service. A smaller one would cap zoom
    at the fit, and gesture specs would see nothing move.
  - Every image and tile as one small PNG.
- Engine differences are skipped with a reason, never loosened:
  - WebKit blocks third-party cookies.
  - Firefox's Tab at the end of a page leaves the page.
  - Synthetic touch pointers cannot be captured, so the pinch spec stubs
    `setPointerCapture`.
  - Timings are checked in Chromium only.
- Playwright's WebKit is the desktop engine. iPhone-only behavior (full screen for a
  video alone, native HLS) is covered by unit tests, not by the `iphone` project.
- On a device or the iOS Simulator, Safari loads the harness at `localhost:4321` with a real
  Manifest URL in `&content=`. `&debug=1` adds a fixed readout of the video element, the
  chrome and the pointer events that reached the page, because there is no console to
  read. The page mutes every `play()`. In the Simulator, drive the page with real touches
  (`touch_path`, `touch2_path`): the plain `tap` sends a click but no pointer events, so
  the chrome never shows.
- An open disclosure in the Canvas holds its chrome on screen (`:has([aria-expanded="true"])`),
  except the panel toggle (`data-button="panel"`), whose panel sits beside the Canvas. Exclude
  any new toggle whose target is outside the Canvas in the same way.
- `src/ssr.test.tsx` runs in Vitest's node environment (`renderToString`).
  `setupTests.ts` skips its DOM stand-ins when there is no `window`. It also gives jsdom a
  desktop's `document.fullscreenEnabled`, which tests of iPhone behavior turn off.

## Data and state

- **One shape: Presentation 4.** `core/load.ts` fetches `iiifContent` once (with the
  request settings) and `core/presentation.ts` upgrades it with
  `upgradeToPresentation4()`. Every part and `Canvas` read P4 only (`placeholderContainer`,
  `accompanyingContainer`, `Timeline` for sound, `motivation` arrays, `{ id, type }`
  targets). Never add a P2/P3 branch to a part; upgrade at the boundary instead. Scenes
  are skipped by `selectSequence` until the `Scene` component exists.
- `createClover()` (`core/clover.ts`) is one Root's state: a small store (`core/store.ts`)
  holding only `status`, `error`, `manifest`, `collection`, `canvasId` and `target`.
  Per-frame and per-tick values (viewport, media element) go through channels, never the
  store; a test asserts that 60 viewport events write nothing.
- Selectors (`core/selectors.ts`) are memoised on the Manifest object. Never mutate the
  Manifest: `core/pages.ts` embeds a referenced annotation page by copying only the path
  to it. A selector must return the same object for the same input (an empty result is a
  shared constant), or `useSyncExternalStore` loops.
- `target` is a pending deep link (content state, `start`, auto-advance). The connected
  Canvas applies it once the Canvas is laid out (`fitCanvasRect` returns false until then)
  and consumes it. The view it opened keeps its placeholder away afterwards.
- Content state is decoded by Clover (`core/content-state.ts`), not `@iiif/helpers`
  (14 kB). `groupViews` must match `@iiif/helpers`' `getManifestSequence`;
  `core/sequence.parity.test.ts` checks that with a Vault used only in the test (the
  Vault normalises in place, so it gets its own copy).
- Parts take `as`, `className` and rest props, render nothing when they have nothing to
  show, and throw a message naming themselves outside a `Root`.
- `Content` imports the connected Canvas (`Canvas/Connected.tsx`) directly. `Canvas`
  loads it lazily, so a standalone Canvas does not carry it.
- **Measuring size.** `initialGzip` starts from the output whose `entryPoint` is the stdin
  `sourcefile` (`entry.mjs`), never "the first output with an entryPoint": esbuild marks
  every lazy chunk an entry point too, and which comes first depends on the graph.
- `build/bundle.test.mjs` bundles through the barrel with esbuild,
  the conservative case: esbuild hoists modules shared by a lazy chunk and anything the
  barrel reaches (`selectors`, `hooks`, `core/value`) into the initial chunk, about 1.1 kB
  for a standalone Canvas (32.7 kB imported directly, 33.8 through the barrel). Rollup
  (Vite) splits it correctly; its library-mode numbers look larger only because Vite
  does not strip whitespace from ES library output.
- **Annotations.** `core/annotation-sets.ts` reads the Manifest's non-painting pages
  (and `addedSets`, from `core/annotation-collection.ts`) into sets of entries, memoised
  on the Manifest. The store holds `annotationId`, `hiddenSets` and `addedSets`; hover is
  the `highlight` channel. Selection is controlled on the Canvas (`selectedAnnotation`),
  which frames a new id once its hotspot is placed. Presentation 4 groups several bodies
  in `Independents`/`Composite`/`List`; read bodies through `bodiesOf()`.
- **Content state out.** `clover.getContentState()` builds it from the viewport channel
  (ignoring a region left over from the previous view) or the media time. `Root`'s
  `onContentStateChange` debounces on store, viewport and media events; there is no
  polling anywhere.
- **Media text.** `core/vtt.ts` parses WebVTT and caches each file's text (`loadVtt`),
  shared by the Canvas's caption tracks and `Transcript`; tests call `clearVttCache()`.
  `Transcript` follows the media element from the `media` channel (`timeupdate`, `seeked`)
  in component state, never the store. Chapters come from `core/ranges.ts`.
- **Upstream bug:** `@iiif/parser` 4.0.3's upgrader rewrites a Range item's Canvas id
  `…#t=0,30` as `…/t=0,30` (and `#xywh=` likewise). Read Range items through
  `rangeItemTarget()`, which restores the fragment. Drop it once the parser is fixed.
- **Items** (`components/Items/`) lists `core/items.ts` models, never resources: one item
  per view of a Manifest (a spread is one item), or one per Collection member. Inside a
  `Root` it is a listbox (`ui/useRovingFocus.ts`, manual activation); standalone it is a
  list of links (`core/load.ts` `fetchResource`, which does not open a Collection).
  Thumbnails come from `core/thumbnail.ts`: sized at once for level 1/2 services, through
  the renderer's cached `fetchInfo` for level 0.
- **Content Search.** `core/search-service.ts` finds the Manifest's service (type
  `SearchService1`/`2`, or a `search/N/` profile or context, as Presentation 2 has it;
  version 2 preferred). `core/search.ts` asks it (following `next`, at most 10 pages)
  and reads both versions into `SearchHit`s and one `AnnotationSet` (`source: "search"`,
  id `SEARCH_SET_ID`) whose annotations are rewritten as Presentation 4 highlighting
  annotations, so the Canvas reads one shape. The store's `search` holds query, status,
  hits and set; `arrive` resets it, and a result for another Manifest (compared by id:
  embedding a page replaces the Manifest object) is dropped. The Canvas draws
  `selectDrawnSets` (annotations plus the search set); the Annotations list does not.
  `clover-search*` classes are 3.x's, so the part's are `clover-content-search*`. It
  loads statically: a lazy split measured larger through esbuild.
- **Map** (`@nulib/clover/map`, `src/map/index.ts`, a third entry). Keep MapLibre small:
  - `maplibre-gl` is a dependency (Mat: the Viewer shows the map by itself, no prop, so
    the default path must resolve it), imported only inside the Map's mount effect.
    `bundle.test.mjs` asserts no entry imports it statically and that the parts reach the
    map only lazily; `@allmaps/*` is on the forbidden list (422 kB gzip). The size table
    has "Map, before MapLibre" and "MapLibre, on a map" (MapLibre's chunks only).
  - The panel offers the tab when `core/geo-detect.ts` `hasMapData` (a look, not a read)
    finds navPlace or a georeference, and lazy-loads `RootMap` from
    `components/Map/MapView.tsx`. That module must never import `Root` (the standalone
    `iiifContent` wrapper is `Map.tsx`, map entry only): a lazy chunk importing `Root`
    made esbuild hoist `Root` and the core into a standalone Canvas (35.6 → 43.7 kB). It
    shares as little as it can with the parts: it builds its overlay URL itself
    (`overlayImageUrl`), not through `core/thumbnail`. What remains is esbuild's chunk
    overhead, about 0.7 kB on a Canvas.
  - The worker URL is global, as MapLibre's is: `setMapWorkerUrl` (`core/map-config.ts`),
    exported from both entries; a standalone `Map` also takes `workerUrl`.
  - `core/geo.ts` reads navPlace (Collection, Manifest, Canvas, annotation `navPlace`,
    GeoJSON annotation bodies) into flat features (`title`, `canvasId`, simplestyle keys;
    MapLibre stringifies nested properties), and georeferencing annotations into
    `Georeference`s, memoised on the Manifest.
  - Georeferences are drawn the basic way, with no Allmaps: the least-squares affine fit
    of the control points in Web Mercator (exact for three) maps the image's corners, and
    the image (about 2048 px via `core/thumbnail` `imageSource`, clipped to the
    SvgSelector mask on a 2D canvas) is a MapLibre `canvas` source under the places.
    Needs CORS on the image. No TPS, no tiled overlay: document, don't add.
  - Inside a Root the Map overlays the view's Canvases only (memoised, or the map is
    re-framed under the reader on every render); standalone `iiifContent` wraps a Root
    with `annotationPages="all"`. Pressing a feature with a `canvasId` goes there.
  - No bundled worker (3.x's is ~500 kB): the host serves it if its bundler moves
    MapLibre's files. The docs build a blob from 3.x's generated worker and call
    `setMapWorkerUrl`. MapLibre's CSS is the host's import too.
  - Wheel zoom off by default; default basemap as 3.x (Liberty, roads removed,
    hillshade); classes `clover-geomap*` (3.x has `clover-map*`); layer ids `geomap-*`.
  - Tests mock `maplibre-gl` (`components/Map/Map.test.tsx`): the module has no
    `default`, so the Map reads `"Map" in module`.
- **Collections.** The store's `collection` is the Collection the shown Manifest was
  reached through; `core/load.ts` `withMembers()` fills a paged Collection's `items` from
  `first`/`next`. `clover.goToManifest(id)` shows a member (fetched by `loadManifest`), or
  `load`s a nested Collection, which then replaces `collection` (there is no way back up
  yet). With a controlled `manifestId` it only asks (`onManifestChange`), and `Root`
  hands the id back through `syncManifest`, as `canvasId` does with `syncCanvas`.
  `isShown()` treats the Collection just entered as shown, so a host naming it does not
  reload it in a loop.
- **Native scroll track** (`ui/useScrollTrack.ts`): CSS scroll snap plus paging, resting a
  slide at an alignment, and mouse dragging that swallows the click ending it. Positions
  come from bounding rectangles and `scrollBy`, so right-to-left needs no special case.
  No carousel library (Embla is on the forbidden list). 3.x's `useTrack` is a copy.
- Buttons in package CSS are selected `button.x`, not `.x`: a reset's `[type="button"]`
  ties with one class, and the tie goes to whichever stylesheet loads last.
- In `dist/styles.css` every rule is in `@layer clover`, so any unlayered stylesheet beats
  it, a reset included (Tailwind 3's preflight clears button backgrounds). That is the
  intended trade: consumer CSS wins. Keep visual rules robust to a reset.
- Part tests mock the renderer with several listeners per event
  (`components/Root/Root.test.tsx`): the connected Canvas adds its own `change`
  listener, which the single-listener mock in the Canvas tests would overwrite.

## Canvas

- `Canvas` (`src/components/Canvas/`, exported as `Canvas`) is Clover's own **2D**
  renderer. It replaces OpenSeadragon (images) and Vidstack (A/V), which 4.x does not use. It is
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
  - While the camera animates, `planFrame` wants the target level for its `destination`
    (where it lands), and for the views on the way only the coarsest level and one
    `IN_FLIGHT_LEVELS` (2) coarser than their target. Planning every in-between view at
    full resolution was 1.8× the tiles on a fast link (M3 benchmark). Draws are always
    of the current view.
  - `scene/uploadBudget.ts` caps new GPU uploads per frame (`UPLOAD_BUDGET_BYTES`, about
    two 512 px tiles, always at least one). A tile held back reads as missing to the
    planner, which paints the coarser level beneath it, and the frame loop runs again.
    Without it, a burst of tiles cost 10–30 ms in one frame at 4–6× CPU throttling.
    Backends report residency through `has(key)`.
- Controls render `src/ui/ControlCluster.tsx` (copied from 3.x `Image`'s controls) with
  click handlers. `ControlButtons` (`src/ui/controlButtons.ts`) includes `choice`.
  Labels come from `useCloverTranslation`.
- `Canvas` draws the IIIF Canvases it is handed (`canvases`) and nothing Manifest-level.
  It has no stepper, no `behavior`, and no Manifest fetching: which Canvases to show,
  and moving between them, is the host's job.
  - `src/components/Canvas/layout.ts` is pure. Its painted images are scaled into each
    annotation's `#xywh=` target. Several Canvases are laid along the `viewingDirection`
    axis at a common height (in a row) or width (in a column). World units are Canvas
    coordinates.
  - For hosts, `src/core/sequence.ts` (`groupViews`) groups a Manifest into views by
    `behavior`. It is the only sequence implementation. `paged` must match
    `@iiif/helpers`' `getManifestSequence`.
- Chrome follows the Player: `useChromeVisibility` sets `data-chrome="visible"` on pointer
  activity, with a `hideDelay` timeout. CSS also shows the chrome on keyboard focus
  (`:has(:focus-visible)`), which is required. The media transport uses the same hook. `Choice` selection is Canvas-level state
  (`findChoices` / `ChoiceSelections` in `layout.ts`), not the host's.
- Video and sound live in `src/components/Canvas/media/`. `MediaStage` is `React.lazy`,
  so its code loads only when a Canvas paints media. Its CSS is in `styles.css` with
  the rest.
  - `useMediaElement` makes the `<video>` imperatively. The renderer moves it into its
    DOM layer, so React must not own it. Sound plays through a `<video>` too, never
    placed in the scene.
  - HLS goes through `hls.js` wherever `Hls.isSupported()`; native HLS only where it is
    not (older iOS). Do not go back to "`canPlayType` says HLS, so play natively":
    Chromium plays HLS natively now, and on that path a `texture` video (never on the
    page) stayed on the lowest rendition and a `dom` one stalled at its first frame.
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
    and buttons styled as 3.x's Player bar. Sound has no waveform, and `wavesurfer.js`
    and `@vidstack/react` are on the build's forbidden list.
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
- The wrapper is a `<figure>`. A shown Canvas with a `summary` or `metadata` (as in
  Cookbook recipe 0029) gets an `i` control (`controls.information`, label "About"). It
  opens `Caption.tsx`, the figure's `<figcaption>`, which must stay its last child.
  - The caption hangs below the cluster, right-aligned, as the Choice and annotations
    menus do. Its z-index is below the cluster's, so zoom and the other controls stay
    usable while it is open. On a phone it sits beside the cluster's column.
  - It is content, not a menu: it does not fade with the chrome or close on an outside
    press. It closes from its ×, the `i` control, or Escape inside it, and stays open
    as the host moves between Canvases that have information.
  - The captioned Canvases' labels name the figure through `aria-labelledby`.
  - `CaptionDetails.tsx` is `React.lazy` and renders `Markup` and `MetadataList`
    (`src/ui/Markup.tsx`), whose sanitiser (`src/core/sanitize.ts`, DOMPurify, ~9 kB
    gzip) loads on first open. Keep it out of the entry chunk; `bundle.test.mjs`
    asserts it.
- A shown Canvas with a `placeholderCanvas` opens on `Placeholder.tsx`. This is a still
  (`placeholderStill()` in `layout.ts`) fitted and centred with container units, and a
  toggle in the top right (the Viewer's magnifier, then a ×).
  - Until it is opened, it holds back everything else: `setImages`, pan and zoom,
    annotations, `Choice` and the media stage. The `i` control is the one exception and
    stays visible beside the toggle.
  - Each new set of `canvases` starts from its placeholder again (`openedFor` keyed by
    `canvasKey`). Reopening re-frames the Canvas (`fit`), as the Viewer remounts OSD.
  - The still lingers, inert, until the renderer's `open` event. `open` fires once the
    coarsest tiles are decoded, so opening never flashes an empty stage.
  - For video and sound, the toggle is a 4rem play button in the centre ("think
    YouTube"). Opening passes `autoPlay` to the media stage, because that press was a
    press of play. Once open, the toggle is the × in the top right. Safari may refuse
    the deferred `play()`; it is swallowed, leaving the transport ready.
- **Web component** (`src/web-components/`): `element.tsx` defines `<clover-viewer>`
  with React APIs and is tested with React; `index.ts` (the build entry) hands it the
  stylesheet (`?inline`, wrapped in `@layer clover`), MapLibre's worker
  (`?worker&url`) and a lazy MapLibre stylesheet. `build/web-components.config.mjs`
  aliases React to Preact (`preact/compat`, `/client`, `/jsx-runtime`) and keeps
  `base: "./"`: an absolute base wrote the worker as `/assets/…`, which failed from any
  path but the site root. `build/web-components.test.mjs` asserts Preact not React,
  MapLibre and hls.js deferred, the worker relative, and the up-front size. The element
  renders into its light DOM and injects Clover's stylesheet once, first in `<head>`.
- **Renderers** (`components/Content/renderers.ts`): `renderers` on `Root` go into the
  context (kept while `sameRenderers`, so an inline array does not change the context
  value), and every `Content` asks `pickRenderer` with the view's Canvases and
  `paintingBodies`. A claimed view is the host's component, not `ConnectedCanvas`. Keep
  this the one override point: templates and the Viewer reach it through `Root`, never a
  prop of their own.
- **Animations** (painting annotations at `#t=` times, `layout.ts` `animationFrames`):
  the scene holds every frame (`paintedImages(…, { allFrames })`), all but the selected
  one `hidden`, and `canvasScene().frames` maps each frame to its image ids. Playing is
  `FrameAnimation.tsx`, lazy: its clock calls `renderer.setHidden(ids)`, which flips draw
  flags only (no preparing, no `change`, no re-placed hotspots). Do not play frames by
  changing `setImages` input: each call prepares items again and a 100 ms frame never
  settles (a blank stage). `SceneImage.hidden` is not part of `sameSpec`; `planFrame`
  keeps a hidden item's tiles coming but draws nothing of it. The clock waits on
  `renderer.isReady(id)` (the coarsest level loaded) before showing a frame. Frames read
  as a timeline (until the next start; the last until `duration`). A Manifest's
  `auto-advance` moves on through `onEnded`, as for media. Fixtures: 0688 and NUL's
  Muybridge plate 626 (`src/fixtures/muybridge-626-annie-g-galloping.json`).
- A body cropped by region through a service passes no declared `width`/`height`: the
  region is in the service's coordinates, and a body may declare a derivative's size.
- Hotspots are `Annotations.tsx` `placeAnnotations`: a rectangle (`xywh`), a point (a
  fixed-size marker in a 40-unit box, which is what pressing it frames, as 3.x), or an
  SvgSelector shape. `core/svg-shape.ts` reads a shape's geometry and box with
  `DOMParser`, copying only geometry elements and validated numeric attributes; the
  hotspot redraws them in an `<svg viewBox=box>` and never injects the selector's markup.
  The button of a point or shape takes no pointer; only the marker or the shape does. The
  reader is lazy (`useSvgReader`, listed in `bundle.test.mjs` `LAZY_MODULES`): it imports
  nothing, so its chunk shares nothing and costs no esbuild chunk overhead.
- Control buttons have a solid background (`--clover-color-secondary`). A translucent
  85% rest state was tried and reverted at Mat's request. Do not reintroduce it.
- Fixtures: `src/fixtures/iiif-image/info.ts` holds the reference server's Göttingen
  `info.json` for 3.0, 2.1 and 2.0, which is the image in Cookbook recipe 0005. The
  Cookbook recipes the tests use are in `src/fixtures/iiif-cookbook/`, as published
  (mostly Presentation 3). Tests read them through `p4()` (`src/fixtures/presentation4.ts`),
  as Clover reads the web.
- Loading is lazy: `useNearViewport` holds back `setImages` and the media stage until the
  Canvas is within half a screen of view, once, and never unloads. Tests install
  `stubViewport()` (`Canvas/testing/viewport.ts`), since the suite's IntersectionObserver
  mock never reports.
- Draws happen only in `requestAnimationFrame` and on demand. A hidden tab or preview pane
  never fires rAF, so verify rendering in a visible browser or headless Playwright.
