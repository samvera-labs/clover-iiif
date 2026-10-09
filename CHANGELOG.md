# Changelog

All notable changes to Clover IIIF are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land under `Unreleased` as they are merged. Version numbers and release dates are
assigned at release time.

## Unreleased

### Changed

- **Canvases default to a `#0001` background, and audio and video no longer letterbox onto
  black.** `options.canvasBackgroundColor` now defaults to `#0001` (it was `#6662`) and
  applies to every canvas: `.clover-viewer-player-wrapper` no longer paints `#000` over it.
  The standalone `Canvas` uses the same `#0001` ground. To keep the old look:

  ```jsx
  <Viewer iiifContent={manifest} options={{ canvasBackgroundColor: "#000" }} />
  ```

  That makes image canvases black too. To make only media black, style the wrapper:

  ```css
  .clover-viewer-player-wrapper {
    background-color: #000;
  }
  ```

- **i18next is gone.** Clover now translates with a small built-in translator: under 1 kB,
  against about 20 kB gzipped for `i18next`, `react-i18next` and
  `i18next-browser-languagedetector`. Those three packages are no longer dependencies, and
  every entry that translates is about 20 kB smaller: `Image` with OpenSeadragon goes from
  142.6 kB to 121.5 kB gzipped. Locale files are also published as a single `JSON.parse`
  each, rather than one binding per string.

  Languages are defined exactly as before:

  ```js
  import { initCloverI18n } from "@samvera/clover-iiif/i18n";

  initCloverI18n({
    lng: "de",
    fallbackLng: ["de", "en"],
    resources: { de: { clover: { informationPanelTabsAbout: "Über" } } },
  });
  ```

  Behaviour you might notice, and what to do about it:
  - **Return value.** `initCloverI18n` returns Clover's translator (`language`,
    `changeLanguage`, `t`), not an i18next instance. Code that called other i18next
    methods on it needs to switch to these.
  - **Options.** Only `lng`, `fallbackLng` and `resources` are accepted. Other i18next
    options (plugins, detection settings, `interpolation`) did nothing useful for Clover
    and are now a type error.
  - **Detection.** The reader's language comes from the browser, then the page's
    `<html lang>`. The detector's other sources (a `?lng=` query parameter, its cookie,
    the `i18nextLng` value it cached in `localStorage`) are no longer read. Pass `lng` to
    pin a language.
  - **Fallback.** Every preferred browser language is tried before English, so a reader
    who prefers `de` then `pt` now sees Portuguese rather than English.
  - **Shared i18next.** Clover no longer touches the global i18next instance, so an app
    that uses i18next itself is unaffected by Clover.

### Added

- **`Canvas` (experimental).** A new standalone component at
  `@samvera/clover-iiif/canvas`: Clover's own 2D pan-and-zoom renderer, drawn with WebGL2
  and falling back to Canvas2D, under development as a possible replacement for
  OpenSeadragon and Vidstack. Nothing else changes: `Image` and the Viewer still use
  OpenSeadragon, and `Canvas` is not exported from the package root.

  ```jsx
  import Canvas from "@samvera/clover-iiif/canvas";

  <Canvas
    body={paintingBody}
    label="A letter"
    onReady={(canvas) => canvas.zoomBy(2)}
    onViewportChange={({ x, y, width, height }) => {}}
  />;
  ```

  It covers what `Image` does, apart from OpenSeadragon's own configuration:
  - **Image services.** IIIF Image API 3.0, 2.1.1 and 2.0, tiled from `tiles`, from a
    level 0 tree's `sizes`, or from tiles Clover cuts itself. Requests use each version's
    canonical URLs.
  - **Images and regions.** `body` and `src` arrays, `isTiledImage`, and `body.region`
    clips.
  - **Annotation hotspots.**
  - **Controls:** the same cluster as `Image`, with `controlButtons`.
  - **Full screen, rotation and keyboard control**, and a **navigator** (an overview in
    the top left). The navigator is off by default; turn it on with `navigator`:

    ```jsx
    <Canvas src={src} isTiledImage navigator />
    ```

  - **An annotations menu.** With `annotations`, a comment control in the cluster lists
    them by their text. Picking one zooms to it and keeps its hotspot highlighted, as
    clicking the hotspot does. `controls={{ annotations: false }}` hides it.
  - **A caption of Canvas information.** When a shown Canvas has a `summary` or
    `metadata` (Cookbook 0029, "metadata anywhere"), an `i` control in the cluster slides
    out a closable box over the picture with each Canvas's label, summary and metadata.
    `Canvas` renders as a `<figure>` (it was a `<div>`), and the box is its `<figcaption>`;
    the captioned Canvases' labels name the figure. Values keep IIIF's limited HTML,
    sanitised as the Primitives do, and the sanitiser loads only when the box first opens.
    `controls={{ information: false }}` hides it.

  It also draws IIIF Canvases: pass one, or the few shown together (a spread), as
  `canvases`.
  - **Several images on one Canvas.** Each painting annotation's image is placed at its
    target. A `Choice` paints its first item, and a Canvas larger than its image is
    filled.
  - **Several Canvases** are laid out in reading order by `viewingDirection`, in any of
    the four directions.
  - **Choice.** A control in the cluster (a bullet-list icon) lists a Canvas's `Choice`
    items and swaps between them, keeping the reader's view. It is added to
    `ControlButtons` as `choice`, so it can be replaced like the others.
  - **Chrome on demand.** The controls, the navigator (when on) and a dark scrim behind them
    appear on pointer activity or keyboard focus inside the Canvas, and fade after
    `options.hideDelay` (2000 ms), as the Player's bar does.
  - **No Manifest awareness.** `Canvas` does not step through a Manifest. Grouping
    Canvases by `behavior` (`individuals`, `paged` spreads with `facing-pages` and
    `non-paged`, `continuous`) and moving between them is the host's job.

  ```jsx
  <Canvas canvases={[leftPage, rightPage]} viewingDirection="right-to-left" />
  ```

  - **Video and sound.** A Canvas painting a `Video` or `Sound` body plays in Clover's
    own transport, styled as the Player's bar: play, seek, volume, time and captions,
    with no Vidstack.
    - **Video.** A single video or sound Canvas is always fitted to the stage, at the
      video's own aspect. It does not pan, zoom or rotate. Full screen moves into the
      transport at the bottom, and the top controls and scrim are not shown. Click the picture to play or pause, and use
      <kbd>Space</kbd>/<kbd>k</kbd>, <kbd>j</kbd>/<kbd>l</kbd> and <kbd>m</kbd> on the
      focused Canvas.
    - **Shared chrome.** The transport shows and fades with the controls, through the
      same `hideDelay`, pointer-leave and focus rules. Chrome now lingers for a second
      after the pointer or focus leaves the Canvas, rather than vanishing at once.
      Mouse focus (a click on the picture) no longer keeps it showing; keyboard focus
      still does.
    - **`navigable` gesture option.** `options.gestures.navigable: false` holds the
      camera still for any Canvas.
    - **Captions.** WebVTT files from `supplementing` annotations, one per language for
      a `Choice`, become caption tracks.
    - **Poster.** A `placeholderCanvas` image is the video's poster.
    - **Sound** plays through the same transport, over the
      accompanying (or placeholder) Canvas's image. It has no waveform.
    - **New props and options.** `onMediaElement` hands a host the element, and
      `onEnded` fires at the end. `options.media.presentation: "texture"` draws video
      frames into the WebGL canvas instead of positioning a `<video>`. This needs CORS,
      and a video without it falls back.

    ```jsx
    <Canvas
      canvases={[videoCanvas]}
      onMediaElement={(video) => {}}
      onEnded={next}
    />
    ```

  Nothing is fetched until a `Canvas` comes within half a screen of view: no image
  service, tiles, video, sound or captions. A hidden `Canvas` waits until it is shown.

  Viewport coordinates are in the image's own coordinates, ready to use as an `xywh=`
  region. An image served without CORS is still displayed, as a real `<img>` placed by
  the same camera.

  A standalone `Canvas` is 32.3 kB gzipped, translations and all its CSS included,
  against 121.5 kB for `Image` with OpenSeadragon. Video and sound add a separate 4.1 kB
  chunk, loaded only when a Canvas paints them.

  The API is experimental and may change in any release.

- **`Image`'s control cluster is now a shared component.** Nothing changes in what it
  renders: its class names, `data-*` attributes, `controlButtons` contract and plugin
  controls are the same.

- **Custom audio/video player.** An audio or video canvas now renders a Clover-styled
  transport bar built on [Vidstack](https://vidstack.io/docs) in place of the browser's
  `<video controls>`. The bar overlays the bottom of the media, appears on hover or keyboard
  focus, and fades after `options.player.hideDelay` (default `2000`ms); a Sound canvas never
  auto-hides, having no video surface to hover.

  This is the default. `options.player.controls: "native"` goes back to the browser's own
  controls:

  ```jsx
  <Viewer
    iiifContent={iiifContent}
    options={{ player: { controls: "native" } }}
  />
  ```

  What the bar shows is read from the Manifest rather than configured: captions from
  `supplementing` annotations with a `text/vtt` body (carrying their IIIF labels and declared
  languages, and honoring `ignoreCaptionLabels`), chapter markers from `structures` Ranges
  whose canvas target has a `#t=` fragment, a quality menu from a painting-annotation
  `Choice`, and the poster and initial scrubber width from the Canvas.

  Two behaviors differ from the native path. The `<source>` fallback list is gone — Vidstack
  applies its own source selection, so the single body the viewer has already resolved is
  passed and the rest appear in the quality menu. And on a Sound canvas the frequency-bar
  `AudioVisualizer` is replaced by a [wavesurfer.js](https://wavesurfer.xyz) waveform; audio
  is decoded up front below a 30-minute cap, and longer files capture peaks as they play.
  HLS audio uses live canvas frequency bars with matching styling instead of WaveSurfer.

  On a Sound canvas that waveform _is_ the timeline: the seek control is layered over it, so
  clicking a bar goes to that moment. The waveform itself stays decorative — a canvas takes no
  focus and wavesurfer's own click-to-seek is pointer-only — so the control doing the work is
  the same ARIA slider the keyboard and screen reader drive.

  Clicking a video toggles play and pause, as every other player does; a Sound canvas does not,
  because a click on its waveform already means "go to this moment". The gesture is a pointer
  shortcut only — the transport bar's play button stays the focusable, labelled control, so
  nothing is reachable by pointer alone.

  `activePlayer` still publishes the underlying media element, so transcript-cue seeking in
  the information panel is unchanged.

  The bar's buttons are the OpenSeadragon control down to the declarations — the same
  `--clover-color-secondary` surface, `-primary` glyph and `-accent` hover — so a control looks
  the same wherever it appears, and themes with the rest of Clover. Type is inherited as
  everywhere else.

  What sits bare on the scrim cannot follow those tokens: the time, the chapter title, the
  slider track, the menu and the cue box have no surface of their own, and their only ground
  is the scrim, which is dark in every theme — `-primary` would put near-black text on
  near-black in a light theme. Those read `--clover-player-text`, `-track`, `-track-shadow`,
  `-menu-surface`, `-menu-hover`, `-caption-surface` and `-caption-text`, documented with
  defaults in the Viewer docs.

- Two new runtime dependencies: `@vidstack/react` and `wavesurfer.js`, included as
  separate chunks. Vidstack loads for custom audio/video players; WaveSurfer loads
  only for non-HLS Sound files within the decoding limit. Image-only viewers and
  native controls load neither. ESM and CommonJS consumers need no import changes;
  their application bundler controls final chunking. WaveSurfer waits for the
  selected file's metadata before initializing, preserving the player's source
  and duration when its module loads asynchronously.

### Changed

- **Web-component scripts now load ES modules asynchronously.** The existing
  `dist/web-components/index.umd.js` URL remains available as a small loader, keeping
  Vidstack and WaveSurfer out of the initial download. Self-hosters must copy the
  **entire `dist/web-components/` directory**, serve `.mjs` files with a JavaScript
  MIME type, and enable CORS for cross-origin hosting. If accessing an element
  immediately after loading the script, wait for its registration:

  ```js
  await customElements.whenDefined("clover-viewer");
  ```

- **HLS Sound canvases use live canvas frequency bars.** The bars match the file
  waveform's centered shape, rounded ends, spacing, and colors. URL and MIME-type
  HLS detection both bypass WaveSurfer; its dynamic import is reached only for
  non-HLS Sound files within the decoding limit. HLS bars work without a finite
  duration and stop animating on pause. No player configuration changes are required.

- **`maplibre-gl` upgraded to 6**, closing
  [GHSA-jrc7-96c5-q579](https://github.com/advisories/GHSA-jrc7-96c5-q579), which has no fix
  in the 5.x line. No action needed on upgrade.

  MapLibre 6 is ESM-only and stopped inlining its web worker, loading one from a URL it
  resolves against its own module instead. Every bundler rewrites that module, so the worker
  file is no longer beside it and the request fails — silently, because raster tiles never
  touch the worker, so a basemap keeps drawing while navPlace geometry, control points and
  `geoJson` never appear. Clover now bundles the worker into its own output and hands
  MapLibre a blob URL, the way MapLibre 5 did, so installing the package is enough in a
  bundler or from a `<script>` tag.

  This costs about 500 KB in each bundle that contains the map, and it needs `blob:` in a
  Content-Security-Policy `worker-src`. Under a CSP that forbids blob workers, serve
  `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` from `node_modules/maplibre-gl/dist/`
  out of one directory of your own — they must stay together — and point Clover at the
  worker:

  ```jsx
  <Map workerUrl="/maplibre/maplibre-gl-worker.mjs" />

  <Viewer
    options={{ map: { enabled: true, workerUrl: "/maplibre/maplibre-gl-worker.mjs" } }}
  />
  ```

- **The Viewer's map tab now runs to the edges of the Information Panel.** Every other tab
  holds text, which wants the panel's gutter; a basemap inset the same way read as a widget
  dropped into the tab rather than the panel's map view, and the inset cost the thing that
  matters most in a panel this narrow. Text tabs are unchanged.

- **The default basemap changed from CARTO Positron to OpenFreeMap's Liberty vector style,
  reshaped by Clover.** CARTO moved their basemaps behind an API key and now serve
  "API KEY REQUIRED" placeholder tiles, so the old default rendered a watermarked map for
  everyone. The new one is vector, free and keyless: Clover removes its road layers and
  adds a hillshade from Mapzen Terrain Tiles on AWS Open Data, giving terrain with political
  borders, country and state names and major cities, sharp at every zoom.

- **`Map` gained a `styleUrl` prop** for a different MapLibre style. Clover uses it exactly
  as authored, without stripping roads or adding relief the way it shapes its own default:

  ```jsx
  <Map styleUrl="https://tiles.openfreemap.org/styles/positron" />
  ```

- **`tileLayer` no longer has a default, and gained `maxZoom`, `referenceUrl` and
  `referenceMaxZoom`.** Pass it for raster tiles instead of a vector style; it takes
  precedence over `styleUrl`. `referenceUrl` draws a transparent overlay above the base
  tiles, so a plain terrain or imagery base can carry labels and borders without the roads
  a combined street basemap would bring. The two `maxZoom` fields cap each source: MapLibre
  requests raster tiles to zoom 22 by default, so a provider that stops short of that goes
  blank once the reader zooms past it — set them and MapLibre overzooms instead:

  ```jsx
  <Map
    tileLayer={{
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      maxZoom: 19,
    }}
  />
  ```

- **Audio and video canvases use the custom player by default.** `options.player.controls`
  defaults to `"custom"` rather than `"native"`, so an existing consumer who configures
  nothing gets the new transport bar. Set it to `"native"` to keep the browser's own
  controls, which keeps the `<source>` fallback list and the frequency-bar `AudioVisualizer`
  as they were. It does not shrink the bundle — see the dependency note above.

  Four things an existing integration may have reached for are no longer in the default
  path's output. All of them still exist under `player.controls: "native"`:

  | Gone from the default path                            | What replaces it                                                                                                  |
  | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
  | `<video id="clover-iiif-video">`                      | Vidstack builds the media element; target `.clover-viewer-player` or the `[data-media-player]` attributes instead |
  | `<source>` children, one per `Choice` body            | A single resolved source, with the rest in the quality menu                                                       |
  | The frequency-bar `AudioVisualizer` on a Sound canvas | The wavesurfer.js waveform, which is also the seek control                                                        |
  | `--clover-color-primary-alt` as the media background  | Black, fixed; style `.clover-viewer-player-wrapper` to change it                                                  |

  If you query `#clover-iiif-video` to drive playback, read `activePlayer` from the viewer
  store instead — it still publishes the underlying media element on both paths, and always
  did.

- Clover's default `secondary` color is now expressed consistently as `#fff` in the
  public token value and every component fallback.

- **Component styling now uses plain CSS instead of Stitches.** Clover no longer ships the
  `@stitches/react` runtime dependency. Each package follows its component graph and bundles
  only the colocated styles those components use; non-visual `helpers` and `i18n` entries carry
  no CSS. Styles are still injected automatically, so consumers do not need to import a
  stylesheet.

- **Full screen keeps the whole viewer.** It used to hand the job to OpenSeadragon's
  `setFullPage()`, which is not the Fullscreen API: it sets `display: none` on every child of
  `<body>` except its own canvas element. Everything else Clover draws is a sibling of that
  element, so the header, the image controls, the thumbnail rail and the information panel all
  disappeared — the rail only survived because it was portalled to the body on purpose, as a
  small panel floating in one corner, and the controls could not be portalled at all because
  OpenSeadragon binds them by element id at init.

  Clover now asks the browser to full-screen its own root instead. Nothing is reparented and
  nothing is hidden, so the reader keeps the viewer they were already using:
  - The thumbnail rail is a band across the full width of the bottom, under both the image and
    the information panel.
  - The image controls and the information panel toggle stay where they are.
  - The viewer header is hidden, giving the image the room; its title, IIIF badge and download
    are a click away in the information panel.
  - The OpenSeadragon navigator drops below the exit control, which shares its corner.
  - The full-screen control turns its arrows inward while full screen is active, and renames
    itself **Exit full screen**, so it reads as where it will take you rather than where you
    already are.
  - An **Exit full screen** control sits top left. `Escape` has always worked, but an
    unadvertised keystroke is not an affordance.

  A standalone `Image` gets the same treatment: it full-screens its own wrapper, offers the
  same **Exit full screen** control, and drops its navigator clear of it. Only one element is
  ever full screen, so an `Image` nested in a full-screen `Viewer` stays quiet and the viewer
  provides the single way back.

  `openSeadragonConfig.showFullPageControl` still decides whether the control appears.
  A `controlButtons.fullPage` replacement now receives an `onClick` in its `buttonProps` and no
  longer depends on rendering the id it is given.

- **Thumbnails fade in once their image has loaded**, in the `Viewer`'s canvas rail and the
  `Slider` alike. Coming on screen and the image arriving are two different moments, and a
  tile used to snap from placeholder to photograph at the second one. The fade is 150ms and
  ease-out — enough to read as the image landing, not enough to feel like an animation still
  running. An image that fails to load is treated as settled, so a broken thumbnail shows its
  alt text rather than staying invisible.

- **OpenSeadragon upgraded from 4.1.1 to 6.1.0**, across two major versions. Clover's
  public API is unchanged and no consumer code needs to change. What is worth knowing:
  - **Rendering now uses WebGL by default.** OpenSeadragon 6 defaults its `drawer` option
    to `auto`, which selects WebGL where available and canvas otherwise (canvas on
    iPad-like devices). Rendering is faster, but each viewer holds a WebGL context, and
    browsers cap how many can exist at once — a page mounting many viewers will log
    `Too many active WebGL contexts` and OpenSeadragon will recover by falling back to
    the canvas drawer. To opt out entirely, pass the drawer through:

    ```jsx
    <Viewer
      iiifContent={iiifContent}
      options={{ openSeadragon: { drawer: "canvas" } }}
    />
    ```

  - **Overlays are now wrapped in an extra element.** Each overlay sits inside a
    `div.openseadragon-overlay-wrapper`, which carries the absolute positioning and, when
    the overlay has an `id`, an `overlay-wrapper-`-prefixed variant of it. Clover's
    `clover-iiif-image-openseadragon-annotation` class stays on the overlay element
    itself, so styling hooks are unaffected — but a selector that assumed an annotation
    was a direct child of the OpenSeadragon canvas needs an extra level.

  - **`@types/openseadragon` is no longer a dependency.** OpenSeadragon 6 ships its own
    TypeScript definitions. Remove `@types/openseadragon` from your project if you added
    it for Clover; keeping it alongside the bundled types risks duplicate declarations.

  - **OpenSeadragon calls `window.matchMedia` unguarded** while resolving the `auto`
    drawer. Browsers all implement it, but a jsdom-based test suite does not — if your
    tests mount Clover's `Viewer` or `Image`, stub `window.matchMedia` in your setup file
    or every such test will throw `window.matchMedia is not a function`.

  - OpenSeadragon itself grew from roughly 57 KB to 85 KB gzipped, so anything importing
    `Viewer`, `Image` or `Scroll` gets correspondingly larger.

- Image viewer controls now color `currentColor` glyphs with Clover's secondary
  token, so the fullscreen icon inverts correctly in dark themes.

- **`Map` renders with MapLibre GL instead of Leaflet.** `leaflet` and
  `@allmaps/leaflet` are replaced by `maplibre-gl` and `@allmaps/maplibre`, and
  `@types/leaflet` is dropped. Both new packages are regular dependencies, so a reinstall
  picks them up. Two things to check when upgrading:
  - If you were loading Leaflet's stylesheet yourself for Clover's map, remove it.
  - If you were reaching into the map's DOM or overriding Leaflet classes, those
    selectors no longer match.

  MapLibre is a substantially larger dependency than Leaflet, which increases the bundle
  for anything that imports `Map` — including the `Viewer` when `options.map.enabled` is
  set.

- **The Viewer's map moved into the Information Panel.** It renders as a `Map` tab
  alongside About and Search rather than in the canvas/painting area, so the canvas always
  shows the image and the map is a companion view. The tab appears only when
  `options.map.enabled` is `true` **and** the resource carries geographic data
  (`navPlace` or georeference annotations). Open the viewer on it with
  `options.informationPanel.defaultTab: "manifest-map"`.

- **`Map` no longer zooms on the mouse wheel or trackpad by default.** A map embedded
  partway down a scrolling page would otherwise swallow the wheel and trap the reader —
  the same reason Clover already disables OpenSeadragon's `scrollToZoom`. Zoom controls,
  double-click and pinch are unaffected. Pass `scrollZoom` to restore the previous
  behavior:

  ```jsx
  <Map iiifContent={iiifContent} scrollZoom />
  ```

- **The default tile provider is now CARTO's Positron (`light_all`) basemap** rather than
  OpenStreetMap's own tiles, with attribution updated for both. Override it with
  `tileLayer`.

- `customTheme` is now applied as inline CSS custom properties rather than a generated
  theme class. The prop shape is unchanged and remains fully supported. Two side effects
  worth knowing: overrides now cascade into nested components such as `Image` and `Map`,
  and the documented `fonts` half of the object takes effect — previously it was silently
  ignored.

- **The Viewer's canvas rail and the standalone `Slider` are now one component.** The
  Viewer used to draw its own thumbnail carousel and its own control bar; both are the
  `Slider` now, so there is a single carousel in the library rather than two that had
  drifted apart. No prop changes are required, but the Viewer's rail looks and behaves
  differently in a few ways worth knowing:
  - **The controls moved from an overlay into a header above the thumbnails.** They used to
    float on top of the rail, absolutely positioned. **This makes the Viewer roughly 46px
    taller at the media strip** — worth checking if you constrain the Viewer's height or
    have tuned `canvasHeight` to fit a layout.

  - **`clover-slider*` class names now appear inside the Viewer.** A rule written for a
    standalone `Slider` will also match the Viewer's rail. Scope it with
    `.clover-viewer-media-wrapper` where you want only one of the two.

  - The radio group that owns canvas selection now wraps the slides only, not the controls.
    Keyboard navigation is unchanged: the group keeps its single tab stop, and arrow keys
    move the selection with the rail following it.

- **Type is inherited, not themed.** Components declare `font-family: inherit` and take
  their family from whatever contains them, so a component dropped into a page that already
  sets a typeface is using it with no configuration at all. There is no `--clover-font-*`
  custom property and nothing to set; to give a component a different family from the rest of
  the page, set `font-family` on an element around it. `customTheme.fonts.sans` still works
  and now applies as a plain `font-family` on the wrapper rather than through a token.

- **The Slider's filter and the Viewer's content search are one search field.** Both render
  a shared `SearchInput`, and both pair it with the shared control button, rather than each
  restyling an input and a button of its own.

- **Every component's controls render the same button.** `Image`, `Map`, the Viewer's rail
  and the `Slider` header previously had four implementations of one control, with
  different disabled treatments, hover shadows and markup. They now share one.

- **Control buttons are inverted.** At rest they take the secondary surface with a primary
  glyph; on hover and focus they fill with the accent and the glyph flips to secondary.
  Disabled buttons keep the resting surface and fade the glyph to 70% opacity. Hover no
  longer applies to a disabled button, which previously left its glyph washed out.

- **The type badge on a Viewer thumbnail sits in the top-right corner** rather than the
  bottom-right, and no longer changes colour on the active item. The active group is already
  marked by its accent underline, its bold caption and its outline; a recoloured badge on top
  of those was one signal too many.

- **Drop shadows are gone throughout the library.** The UI popover, the Viewer's header
  popover and the full-page thumbnail strip take a hairline border in place of theirs, since
  a shadow was their only edge. Focus indicators are unaffected.

- **`Slider` slides are sized by their own content** rather than by a fraction of the
  viewport, so how many are visible follows from the card width and the space available.

- **`Slider`'s `options.spaceBetween` accepts a CSS length string** as well as a number, so
  a gutter can be expressed in `rem`. The default is now `1rem`.

### Fixed

- **The Viewer's title row no longer adds space above itself.** The manifest title and the
  options beside it had `1rem` of padding on every side, so with the title shown the Viewer
  started 16px lower than `Image`, `Map` or `Slider`. The top padding is gone and the title
  now sits flush with the top edge; the row is 16px shorter. If you relied on the old gap,
  restore it from your own stylesheet:

  ```css
  .clover-viewer-manifest-label,
  .clover-viewer-header-options {
    padding-top: 1rem;
  }
  ```

- **Video placeholder images appear before playback again.** Images supplied by
  `placeholderCanvas`, including Cookbook recipe 0013, show while the custom player
  loads and above the initial video frame. They disappear when playback starts.
  Moving to a canvas without a preview clears the previous poster. No configuration
  changes are required.

- Transcript cues now release their playback listeners when replaced or unmounted,
  and highlight the current cue immediately when the transcript or player changes.
- Annotations without body text no longer render the placeholder "None" or expose it
  in `data-content`. Bodyless PointSelector annotations retain a timestamp-only seek
  control, including points at `0` seconds. No consumer changes are required.

- **Captions wrapped in a `Choice` are now found.** A `supplementing` annotation may carry
  its caption bodies directly or wrap them in a `Choice`, which is how a manifest expresses
  one track per language — the pattern in the Cookbook's
  [Multiple Language Captions](https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/)
  recipe. The Vault mints a `vault://<hash>` id for that Choice, and the caption gate rightly
  rejects such ids, so walking annotation bodies alone found nothing: those manifests rendered
  no `<track>` elements at all. Both player paths now share `collectCaptionResources`, which
  opens a Choice and resolves its items, so the `<track>` list and the custom player's captions
  menu can never disagree about what counts as a caption.

  Caption `srcLang` also now comes from the body's own `language` where it declares one,
  instead of always being `"en"`.

  The information panel's transcript understands the same `Choice`. It previously read only
  the first body, found a Choice with no `format`, and rendered the literal string `"None"`;
  it now offers a dropdown of languages and renders the selected track's cues. The dropdown is
  the same control a painting `Choice` and a Collection use, so it stays one control at one
  height however many languages a Manifest carries.

- **The transcript and the player agree on which caption track is selected.** Choosing a
  language in the player's captions menu moves the information panel's transcript to the same
  track, and choosing one in the panel moves the player's overlay — but only when the overlay
  is already on, since picking a transcript to read is not a request to start drawing captions
  over the video.

  Switching captions **off** hides the overlay and nothing else: the transcript stays
  navigable, and the selected language is remembered. The two are separate concerns and the
  new `activeCaptionSrc` in the viewer store is a selection, never a visibility flag.

- **Choosing a chapter in the table of contents goes to that chapter.** It only ever changed
  canvas, and returned early when the canvas was already the one on screen — so on a Manifest
  whose chapters are time fragments of a single canvas, which is what `structures` on an A/V
  Manifest usually are, every chapter did nothing at all. The Cookbook's
  [table of contents for A/V content](https://iiif.io/api/cookbook/recipe/0026-toc-opera/) is
  the case: all four of its entries now seek, including the one that declares a start with no
  end. Where a chapter is on another canvas, as in
  [the multiple-canvas variant](https://iiif.io/api/cookbook/recipe/0065-opera-multiple-canvases/),
  the canvas changes and the seek is applied once that canvas's media reports its duration.

  Playback is left as it was found: a paused reader browsing the contents is not asking to
  start it, and one already playing carries on from the new position.

- **The table of contents marks one row, the one you are actually in.** Every Range targeting
  the active canvas was marked current, so an entire act lit up at once — the parent and both
  of its chapters — and several rows competed in bold. The row marked now is the deepest one
  whose `#t=` span holds the playhead, which is the same thing the transcript does with the cue
  being spoken, and it moves between chapters as playback crosses them. A Manifest whose Ranges
  carry no time fragment still matches on canvas alone, so an image Manifest behaves as before
  — except that there too only the deepest matching row is marked rather than the whole
  ancestry.

  The highlight belongs to the **chapter**, not the line: the wash and marker run down the whole
  containing chapter, past its sub-chapters, and the sub-chapter you are on is distinguished by
  weight alone. There is one vertical rule and one bold in the list at any time.

- **The contents chapter and the transcript cue share one active treatment.** Both are a list of
  places to jump to, and both now mark where you are the same way: a faint wash and an accent
  marker down the leading edge, bled past the panel gutter. The two rules are kept deliberately
  in step and cross-reference each other.

### Removed

- **The number beside each row in the table of contents.** It was the target canvas's position
  in the viewer's own sequence, not anything the Manifest declared, so on Ranges spanning
  several canvases it read as an arbitrary sequence (1, 3, 3, 5) next to labels that often carry
  their own numbering. Nothing in the panel now renders a value the Manifest did not supply.

- **The scrubber no longer flickers on hover, and the chapter title keeps up.** The chapters
  track was handed a fresh `{ cues }` object on every render. Vidstack compares that prop by
  identity, so the track was torn down and rebuilt constantly, and a rebuilt track is briefly
  empty — which the scrubber draws as one full-width segment before the real markers return.
  Hovering the bar re-renders often enough to make that read as a flicker, and it left the
  active-chapter state with nothing stable to track, so the title and the chapters menu stayed
  on the first chapter however far playback moved. The title now changes at the chapter
  boundary, and five hover passes over the bar produce one stable layout where they previously
  alternated between two.

- **The captions button is gone when a Manifest has no captions.** Vidstack's caption options
  always include an "Off" entry, so counting them found one option on a Manifest with no
  `supplementing` VTT at all, and offered a button whose only choice was to switch off captions
  that never existed. Whether the control appears now follows the real tracks.

- **Chapter markers on the scrubber are drawn one per chapter, at their real lengths.** The
  segments were nested inside a single wrapper that Vidstack then treated as the only chapter:
  it was sized to the whole duration, so the segments divided the bar evenly instead of by
  length — a five-minute prelude drawn as wide as the hour that followed it — and they all
  shared the slider's fill, so every segment advanced at once. On the Cookbook's
  [multiple canvases](https://iiif.io/api/cookbook/recipe/0065-opera-multiple-canvases/) opera
  the two chapters now measure 7.6% and 92.4% of the bar, matching their `#t=` fragments, and
  each fills over its own span.

- **A transcript from a `Choice` is no longer indented past an empty thumbnail well.** The
  annotation row published the format of the first body on `data-format`, and a `Choice` of
  caption tracks has no format of its own, so the row read as `text/plain`. The stylesheet keys
  its layout off that attribute, so a transcript kept the 2rem thumbnail square and the 1rem gap
  meant for a text annotation and started 48px in from the panel edge. The row now publishes the
  format it actually renders.

- **The cue being spoken is visible again.** It was marked up correctly the whole time —
  `aria-checked` has always tracked playback — but the only styling was a 13% grey wash, which
  comes out at 1.11:1 against the panel in either theme. The active cue now carries an accent
  marker down its leading edge, drawn as an inset shadow so the row keeps its width and the list
  cannot shift as playback moves between cues. `forced-colors` gets a `Highlight` outline.

- **Transcript cue rows keep a stable identity across renders.** Every parsed WebVTT cue is
  given an identifier, because a WebVTT file need not carry cue ids — but the cue synthesised
  for a `PointSelector` annotation had none, so React was rebuilding the list on each render
  rather than updating it. The synthesised cue now takes the annotation's id, and the list falls
  back to the cue's timing rather than trusting a field its own type marks optional.

- **Switching caption language no longer leaves the player and the transcript fighting.** The
  two were kept in step by a pair of effects that mirrored each other: one wrote Vidstack's
  active track into the viewer store, the other applied the store back to the track list. They
  could not settle, because Vidstack's idea of the active track and the `mode` flags on the
  track list disagree while a switch is in progress — so each effect read a different answer and
  corrected the other. Toggling between two languages set them flipping several hundred times a
  second, refetching a WebVTT file on every pass, with the picker naming one language while the
  transcript below it showed the other.

  Both caption menus belong to Clover, so each now publishes the reader's choice directly when
  they make it, and a single effect applies that choice to the player. One direction of travel,
  nothing to echo. Three toggles that previously produced about 2,500 fetches now produce four.

  A switch is also exclusive: the chosen track was turned on without the previous one being
  turned off, which left two caption tracks showing at once.

- **The transcript holds still while its language list is open.** The panel re-centres itself on
  the cue being spoken 1.5 seconds after the reader stops scrolling. That is what you want while
  reading along and the opposite of what you want while reaching for the control above it: the
  list slid away mid-reach and the click landed on whatever had moved into its place, so the
  menu appeared not to open at all.

  Opening the list now holds the panel where it is and hands control back on close, using the
  same two flags `Cue.tsx` already sets around its own scrolling — one to stop a cue scrolling
  the panel, one to stop the panel's scroll handler re-arming the expiry a moment later. The
  hold carries a timer, so an abandoned one always expires.

- **"Off" in the captions menu is translated.** The string was in all eight locale files as
  `playerCaptionsOff` but was never handed to Vidstack, which composes that row itself and
  labels it with its own English default — so the one entry in the menu that is not a track
  name stayed in English beside entries that were not.

- `Select` now forwards `onOpenChange`. Its props extended Radix's, which advertised the
  callback, but the component never passed it on.

- **Dropdowns follow the page's theme instead of inverting against it.** `Select` carried
  `.dark` overrides that pointed its surface at `--clover-color-primary` and its text at
  `-secondary`. A page with a dark theme already maps dark values onto those properties, so the
  overrides swapped a correctly dark dropdown back to light — a pale panel on a dark page, in the
  painting `Choice`, the Collection picker and the caption picker alike.

  They were also the only rules in the library keyed off a `.dark` class, which is the host
  page's convention rather than Clover's; every other component takes its dark mode from the
  tokens alone. Removing them leaves one set of rules that is correct in both themes: measured
  against the docs site, a menu row reads 15.98:1 in light and 16.25:1 in dark, on a surface that
  matches the page either way.

- **The dropdown no longer shifts the page when it opens, or lets content show through it.**
  Both affected every Clover dropdown — a painting `Choice` and a Collection as much as the new
  caption picker.

  Opening one locks the page scroll, which takes the scrollbar and its gutter away; the width
  was handed back as a right margin, which a body sized to the full viewport ignores, so a
  centred page slid sideways by half the scrollbar. The gutter is now restored as padding,
  which is inside the width whatever the body is sized by.

  The list also had no stacking order of its own, so anything the Viewer positions above the
  flow — transcript cues, the control bar, the panel tabs — painted over the open list. It now
  carries `z-index: var(--clover-select-z-index, 100)`; raise it if your own overlays sit higher.

- **Switching transcript language twice in quick succession no longer leaves the panel showing
  the wrong one.** Each language change starts a fetch, and two in flight did not necessarily
  land in the order they were sent — the slower response wrote last, so the picker said one
  language while the cues below it were in the other. Nothing re-fetched, so the disagreement
  stayed until the canvas changed. A superseded request is now abandoned and can no longer
  write.

- **An audio or video canvas now letterboxes onto black**, instead of taking
  `options.canvasBackgroundColor`. That option's `#6662` default is translucent, so the bars
  either side of a letterboxed frame composited over whatever sat behind the Viewer — grey in
  a light theme, and inverting with the theme in a dark one. Black is what the rest of the web
  letterboxes onto, and it is the ground the caption box and the control bar's palette are
  pitched against. `canvasBackgroundColor` still applies to image canvases; to change the
  colour behind media, style `.clover-viewer-player-wrapper`.

- **Full screen no longer leaves the host page's text colour behind.**
  `.clover-viewer[data-fullscreen="true"]` (and the `Image` equivalent) painted
  `--clover-color-secondary` as the background but let the text colour keep inheriting from
  the page. An app with a dark theme that had not retheme'd Clover's tokens therefore got its
  own light text on Clover's white full-screen ground — measured at **1.16:1** against the
  WebVTT cues in the information panel, against 16.96:1 after the fix. Background and colour
  are now set together, so the pair stays consistent whether the tokens are themed or left at
  their defaults.

### Added

- **`options.showResourceIcons` on `Viewer`**, defaulting to `false`. It governs the
  resource-type badge on each thumbnail in the canvas rail. Off by default because on a
  Manifest of scanned pages every canvas is an image, so the badge repeated one glyph down
  the whole rail without distinguishing anything; turn it on for a mixed Manifest. The
  runtime on a video or sound canvas is not governed by it and always shows — with the option
  off, such a canvas carries a badge holding just its duration.

- `Viewer` now renders a `Contents` Information Panel tab for Manifests with IIIF
  `structures`; select a Range to jump to its first Canvas. Hide it with
  `options.informationPanel.renderContents: false`, or open on it with
  `options.informationPanel.defaultTab: "manifest-contents"`.

- **Theming with CSS custom properties.** Every component reads `--clover-color-*`. Set them
  on any ancestor element, or in a stylesheet, and the value cascades in — no prop required,
  and it can be scoped to part of a page or changed at runtime:

  ```css
  .my-app {
    --clover-color-accent: #c62828;
  }
  ```

  Each token falls back to Clover's own value when unset, so the library still styles
  itself with no configuration. See the Theming section of the Viewer documentation for
  the full list.

- `scrollZoom` prop on `Map`, defaulting to `false`.

- Root class names for styling: `clover-map` on `Map` and `clover-slider` on `Slider`.
  Neither root previously carried a class, so they could not be targeted from consumer
  CSS.

- `clover-viewer-header-options` on the Viewer header's options bar, which holds the
  download control and the IIIF badge. It previously carried no class.

- Zoom controls on `Map`.

- `informationPanelTabsMap` i18n key for the Map tab label.

- **`Slider` works on an `items` array, not only a Collection URL.** Pass an already
  resolved Presentation API `items` list and it renders with no fetch, which is what lets it
  serve any list of IIIF resources — the members of a Collection, but equally a set of
  annotations — and what lets other components embed it. `label` and `summary` are available
  alongside it, since there is no resource to read them from.

- **`Slider` respects the IIIF `behavior` of the resource it opens**, and takes a `behavior`
  prop to override it: `individuals` (the default), `paged`, `continuous` or `unordered`.
  `paged` pairs items into spreads opening on a lone cover; `continuous` closes the gutter
  so the sequence reads as one object.

- **`search` and `onSearch` on `Slider`.** `search` renders a filter control in the header.
  On its own the Slider narrows its own `items` by label; pass `onSearch` to take the
  filtering over and hand back a shorter list, which is what the Viewer does — its slides are
  paged groups with no label of their own.

- **`pager` on `Slider`**, a `{ current, total, onStep }` position in the host's own
  sequence. It shows a counter in the header and hands the arrows to `onStep`, so they move
  the host's selection rather than scrolling the rail. The counter may count in different
  units than the slides: the Viewer counts canvases while its slides are paged spreads.

- **Embedding seams on `Slider`** for using it as a subcomponent: `activeIndex` to keep a
  host's selection centred, `renderItem` to draw a slide's contents, `wrapItems` to own the
  slide region's semantics without enclosing the header, `presentational` to drop the
  carousel ARIA, `showHeader`, `align`, `dragFree`, `slidesToScroll` and `isRtl`.

- **Thumbnail sizing through CSS custom properties.** `--clover-thumbnail-width` and
  `--clover-thumbnail-height` size thumbnails across the Viewer and `Slider` — one pair for
  the whole library, with no component-specific variant. Thumbnails are square by default,
  derived from the width, unless a height is set:

  ```css
  .my-app {
    --clover-thumbnail-width: 100px;
  }
  ```

- **A visible focus ring on the OpenSeadragon canvas.** It had `tabindex="0"` but no focus
  state of its own. The ring is drawn above the artwork and meets WCAG 1.4.11's 3:1 against
  its halo for every accent, in both themes, with a forced-colors fallback.

- **The thumbnail rail stays available in full screen.** It floats bottom-left over the
  OpenSeadragon full-page view so items remain navigable.

- `embla-carousel-wheel-gestures` (2.3 KB gzipped) so the carousel responds to a wheel and
  trackpad, which a clipped carousel viewport otherwise swallows.

### Deprecated

- **`commonOpen`, `commonClose`, `commonNext`, `commonPrevious` and `commonSearch`.** No
  component reads these any more, so overriding one has no effect. Move the override to the
  key that replaced it: `imageViewerOpen`, `imageViewerClose`, `sliderNext`,
  `sliderPrevious` or `sliderSearch`. They still ship, and `commonSearchPlaceholder` is
  unaffected and still in use.

- **`customTheme` on `Viewer`.** Use the `--clover-color-*` custom properties instead, and
  plain `font-family` for type. `customTheme` continues to work and is planned for removal in the
  next major version; no change is required today.

### Removed

- **`options.slidesPerView` on `Slider`.** **Breaking.** Slides are sized by their own
  content now, so a count divided into the viewport no longer describes the layout. Set the
  card width instead, in CSS:

  ```css
  body {
    --clover-thumbnail-width: 15rem;
  }
  ```

- **`.clover-viewer-media-controls` and `.clover-viewer-media-navigation`.** **Breaking for
  consumer CSS.** The Viewer's own control bar no longer exists; the Slider's header is
  there instead. `.clover-viewer-media-wrapper` still wraps the whole rail.

- **`.clover-viewer-media-search`.** **Breaking for consumer CSS.** The filter control is
  the shared one now and carries `.clover-slider-search`.

### Fixed

- **`@radix-ui/react-form` upgraded to 0.1**, so installing Clover alongside React 19 no
  longer prints peer-dependency warnings. No action needed on upgrade.

- **Accessible names on the painting toggle and the slider controls.** The button over a
  canvas was named "Open" or "Close", and the rail's controls "Next", "Previous" and
  "Search", none of which said what they acted on (WCAG 4.1.2). They now read "Open image
  viewer" / "Close image viewer", "Next item", "Previous item", "Search items" and "Close
  item search", from the new `imageViewerOpen`, `imageViewerClose`, `sliderNext`,
  `sliderPrevious`, `sliderSearch` and `sliderSearchClose` keys. Every bundled locale
  carries all six.

- The painting toggle and the map's zoom controls name their icons through `role="img"` and
  a `<title>` alone. Both used `aria-labelledby` against a hard-coded id, so two viewers on
  one page repeated it and every button resolved to the first title.

- Metadata pairs are no longer wrapped in a `role="group"` element. `dl` accepts a plain
  `div` between itself and its `dt`/`dd` children but not that role, which broke the
  pairs' association (WCAG 1.3.1). The `data-label` selector hook is unchanged.

- The image control cluster stays within the canvas at high zoom. It was anchored top-right
  with no bound of its own, so at 400% on a 1280px viewport the buttons ran past the bottom
  edge and the last of them could not be reached (WCAG 1.4.10). It now wraps into a second
  line within a height budget derived from its own top offset, and a wrapped row stays
  anchored to the edge the cluster is offset from.

- The information panel shows where keyboard focus has landed. Radix gives the tab panel a
  tab stop so its content can be scrolled without a pointer, but nothing rendered a focus
  indicator for it (WCAG 2.4.7).

- Moving between canvases is announced. The image was replaced in place with nothing said,
  so a screen reader user stepping through the rail got no confirmation the canvas changed
  (WCAG 4.1.3). A polite live region names the new canvas, falling back to its position
  ("Item 2 of 4", from the new `canvasPosition` key) where the canvas has no label.

- `useCloverTranslation` interpolates values into its English fallback. A key carrying
  placeholders reached the reader verbatim when i18next handed the key back.

- **The bundled stylesheet now reaches consumers.** Vite extracted every imported `.css` into
  `dist/<pkg>/style.css` and stopped there, and nothing could reach that file: `exports` lists
  no `.css` entry and the documentation states no stylesheet import is needed. MapLibre's CSS
  went missing with it, so a `Map` rendered unstyled for anyone consuming the package. The
  build now appends each entry's reachable component CSS to its JavaScript and injects it as a
  `<style>` element at runtime, in the ESM, CJS and UMD outputs alike — verified in a browser
  against the built UMD bundle with no `<link rel="stylesheet">` present.

- The content search placeholder in the Viewer's information panel is legible. It was pinned
  to `#0006` — black at 37.5% — which measured 2.8:1 against the field in a light theme and
  1.16:1 in a dark one, where it was effectively invisible. The field is the shared search
  input now, whose placeholder is `$primaryMuted`: 5.22:1 light, 7.64:1 dark.

- The content search submit button matches the rest of the library's controls. It had kept an
  accent fill at rest and a `drop-shadow` on its glyph, having been missed by both the control
  inversion and the shadow removal because it only renders inside a panel tab.

- The type badge on a Viewer thumbnail is legible in a dark theme, and matches the control
  buttons. It was a hardcoded near-black `#000d` behind a `$secondary` glyph, and since only
  the glyph flipped with the theme, a dark theme put a near-black icon on a near-black badge
  and it vanished. Both halves are tokens now — a `$secondary` badge carrying a `$primary`
  glyph — so the pair is opposite by definition: 16.25:1 in dark, 15.98:1 in light.

- The Viewer's header no longer reserves an empty options bar when `showDownload` is on and
  the resource has nothing to download. `showDownload` says the consumer wants the button,
  not that the Manifest or Canvas carries any `rendering` to hang off it — the download
  control itself was already correctly rendering nothing, but the bar around it was built on
  the option alone, and it carries padding and grows to fill the row. With the IIIF badge
  also hidden, that left an invisible box in the header.

- Disabled controls no longer respond to hover. A spent arrow kept the hover rule's light
  glyph over its dimmed surface and washed out.

- Disabled control glyphs dim reliably. Dimming was written as a colour swap, which only
  reached the arrows — they are stroked with `currentColor` while the search and close icons
  are filled — leaving half the icon set at full strength.

- The Viewer's information panel toggle inverts correctly on a small viewport. Its
  small-screen counterpart kept the old dark palette because it never renders at wider
  widths.

- The Slider's header no longer renders an empty label and summary when a host supplies
  neither. They measured 0×0 but carried the `clover-slider-header-*` class hooks and a top
  margin, so anyone styling those names saw phantom elements.

- The Slider's prev/next arrows are wired through props rather than by finding each other's
  DOM nodes with `document.querySelector`, which broke when more than one Slider was on a
  page.

- A `Slider` given an empty `items` array renders its header and an empty rail rather than
  nothing. A filter matching no items used to unmount the field being typed in.

- The Slider's arrows step and centre the next group of items. They previously jumped by the
  breakpoint's group size regardless of what was on screen, overshooting by several screens.

- **A second `Viewer` on the same page no longer renders into the first one's OpenSeadragon
  container.** `defaultState` is computed once, at module load, and `Viewer` spread it into
  `ViewerProvider`'s `initialState` without giving `viewerId` a fresh value the way it already
  did for `vault`. Every `Viewer` that did not supply its own `initialState` inherited the
  exact same `viewerId`, which becomes part of the OpenSeadragon container's DOM id — so a
  second, simultaneously mounted instance's canvas silently ended up targeting the first
  instance's element via `document.getElementById`, and appeared blank. `viewerId` is now
  generated fresh per instance, alongside `vault`.

### Documentation

- New homepage built around an interactive playground: pick a component, point it at a
  IIIF resource, turn its options, and copy the generated JSX. Its state is held in the
  URL, so a configuration can be shared as a link.
- Theming documented, covering both the custom properties and the `customTheme` prop.
- `scrollZoom` documented, including how to restore wheel zoom.
- `Slider`'s documentation opens with the two jobs it now serves: a carousel of links, where
  each slide is an anchor to the item's `homepage[0].id` and `onItemInteraction` intercepts the
  click, and a rail inside another component, which is what the `Viewer`'s canvas navigation
  is. The prop set each one uses is shown side by side.
- `Slider`'s API reference rewritten around what the component now does: a Controls section
  covering `search`, `onSearch`, `pager` and `isRtl`; an Embedding section for the
  subcomponent seams; the `behavior` values; and sizing through the thumbnail and card custom
  properties.
- The playground shares a configuration with `?iiif-content=`, the parameter Clover already
  accepted for handing a resource to the docs, rather than a private short form. An explicit
  `iiifContent` prop now takes precedence over that parameter, so a component driven by props
  is not overridden by the URL.
- The homepage playground gained controls for the `Slider`'s behavior, header, filter,
  snapping and alignment,
  and for the thumbnail custom properties on both `Viewer` and `Slider`, so the effect of
  each can be seen and copied.
