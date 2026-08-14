# Changelog

All notable changes to Clover IIIF are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land under `Unreleased` as they are merged. Version numbers and release dates are
assigned at release time.

## Unreleased

### Changed

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

### Added

- `Viewer` now renders a `Contents` Information Panel tab for Manifests with IIIF
  `structures`; select a Range to jump to its first Canvas. Hide it with
  `options.informationPanel.renderContents: false`, or open on it with
  `options.informationPanel.defaultTab: "manifest-contents"`.

- **Theming with CSS custom properties.** Every component reads `--clover-color-*` and
  `--clover-font-*`. Set them on any ancestor element, or in a stylesheet, and the value
  cascades in — no prop required, and it can be scoped to part of a page or changed at
  runtime:

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

- Zoom controls on `Map`.

- `informationPanelTabsMap` i18n key for the Map tab label.

### Deprecated

- **`customTheme` on `Viewer`.** Use the `--clover-color-*` and `--clover-font-*` custom
  properties instead. `customTheme` continues to work and is planned for removal in the
  next major version; no change is required today.

### Documentation

- New homepage built around an interactive playground: pick a component, point it at a
  IIIF resource, turn its options, and copy the generated JSX. Its state is held in the
  URL, so a configuration can be shared as a link.
- Theming documented, covering both the custom properties and the `customTheme` prop.
- `scrollZoom` documented, including how to restore wheel zoom.
