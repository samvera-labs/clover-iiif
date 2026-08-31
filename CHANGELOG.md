# Changelog

All notable changes to Clover IIIF are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land under `Unreleased` as they are merged. Version numbers and release dates are
assigned at release time.

## Unreleased

### Changed

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
