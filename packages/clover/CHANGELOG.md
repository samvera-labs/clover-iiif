# Changelog

All notable changes to `@nulib/clover` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`@nulib/clover` is the composable 4.x Clover. It is not published yet. The 3.x line,
`@samvera/clover-iiif`, keeps its own changelog at the repository root.

## Unreleased

### Added

- **The package.** One entry, ES modules only, with named exports, so
  `import * as Clover from "@nulib/clover"` gives dot notation and tree-shakes. Styles
  ship as one stylesheet, `@nulib/clover/styles.css`, in `@layer clover`, so your own
  unlayered CSS wins. Import it once; components never inject CSS. Peers: React 18 or 19.
- **`groupViews`, `resolveBehavior` and `resolveDirection`**, the rules that group a
  Manifest's Canvases into views by `behavior` and lay them out by `viewingDirection`.
- **`initCloverI18n`**, as in 3.x. Translations are bundled for en, es, fi, fr, nb, nn,
  no and pt.
- **`Clover.Root` and its parts.** `Root` loads `iiifContent` and holds where the reader
  is; parts read from the nearest `Root`, wherever they sit in your markup.
  - `Content` draws the current view (a page, a spread, a video or sound) with `Canvas`.
  - `Label` shows the Manifest's label, or the current Canvas's with `of="canvas"`, in the
    reader's language and marked with `lang`.
  - `Previous`, `Next`, `Position` and `Pager` move a view at a time, a spread at a time
    in a paged book. Their arrows and order follow `viewingDirection`.
  - `Status` shows loading and errors.
  - `Root` announces each move in a polite live region.

  ```jsx
  <Clover.Root iiifContent={url}>
    <Clover.Label as="h1" />
    <Clover.Content />
    <Clover.Pager />
  </Clover.Root>
  ```

- **`Clover.Viewer`**, those parts put together, built only from public exports so a
  custom layout can start from a copy of it. Its `items` prop picks the thumbnails'
  layout, or `false` for none; `panel={false}` drops the information panel beside the
  stage, and `defaultPanelOpen` sets whether it starts open. Its classes are
  `clover-layout*`, so they never meet 3.x's `clover-viewer*` on a page with both. A
  Share button sits in its header (`share={false}` removes it).
- **The descriptive properties as parts:** `Summary`, `Metadata`, `RequiredStatement`,
  `Rights`, `Homepage`, `Rendering`, `SeeAlso`, `PartOf`, `Thumbnail` and `Id`, beside
  `Label`. Each reads the Root's Manifest, or the current Canvas with `of="canvas"`; a
  `value` prop wins, so they work outside a `Root` too. Text is in the reader's language
  and marked with `lang`.
- **HTML in IIIF values is sanitised**, allowing only the markup the Presentation API
  permits and `http(s):` or `mailto:` links. Scripts, event handlers, `style`, SVG, and
  `javascript:` or `data:` URLs are removed. A value with markup shows as plain text until
  the sanitiser (DOMPurify) has loaded, which happens only when some value needs it.
- **`Clover.InformationPanel`**, tabs of information about the Root's resource, with
  About by default. Give it `Clover.Tab` children (`value`, `label`, and anything as
  content) to choose the tabs, including your own; this replaces 3.x's information panel
  plugins. `value` / `defaultValue` / `onValueChange` control which tab shows. Given
  `onClose`, it has a close button at the end of its tabs; closing from inside it hands
  focus back to the control whose `aria-controls` names it (or an element around it), so
  focus never stays on something hidden. `closeOnEscape` closes it on Escape as well, for
  a panel floating over the page. The Viewer, Classic and Document panels all close this
  way; Document's, which floats, also closes on Escape and takes focus when it opens.
- **`Clover.About`**, everything the Manifest says about itself, in the order 3.x's About
  tab shows it.
- **`Clover.PanelToggle`**, which shows and hides the panel. Given to `Clover.Content` as
  a child, it sits in the Canvas's controls. The controls still fade while the panel is
  open: only a menu open over the Canvas holds them on screen.

  ```jsx
  <Clover.Content>
    <Clover.PanelToggle open={open} onOpenChange={setOpen} controls="panel" />
  </Clover.Content>
  <Clover.InformationPanel
    id="panel"
    hidden={!open}
    onClose={() => setOpen(false)}
  />
  ```

- **`<clover-viewer>`**, the Viewer as a custom element for pages without React, from
  `@nulib/clover/web-components` (`dist/web-components/index.mjs`, and `index.umd.js` for a
  classic `<script>` from a CDN). Built on its own with Preact standing in for React.
  Attributes `iiif-content`, `canvas-id`, `manifest-id`, `language`, `search-query`,
  `items`, `panel`, `share`, `download`; an `iiifContent` property for objects; events
  `canvaschange`, `manifestchange`, `contentstatechange`. Light DOM, as 3.x's. About
  86 kB gzip up front (3.x's element: about 530 kB); MapLibre, its worker and its
  stylesheet load only with a map.

  ```html
  <script src=".../web-components/index.umd.js"></script>
  <clover-viewer
    iiif-content="https://example.org/manifest.json"
  ></clover-viewer>
  ```

- **`Clover.Download`**, as 3.x's Viewer offers it: the `rendering` of the Canvases in
  view ("This page") and of the Manifest ("All pages") — a PDF, a text, a full-size file —
  as links behind one button, opening towards the side with room. It is in the Viewer's
  header, Classic's and Document's (`download={false}` removes it, 3.x's `showDownload`),
  and renders nothing when there is nothing to download.
- **Renderers of your own** (3.x's `customDisplays`): `renderers` on `Root` (or one
  `Content`) draws the views it claims — by Canvas id, painted body `format`, or a `match`
  test — with your component instead of `Canvas`. It gets the view's `canvases`, their
  painting `bodies` and `Content`'s children, and can call Clover's hooks. The Viewer and
  templates pass it through to their `Root`. An inline list is kept while it says the
  same, so it never re-renders the parts.

  ```jsx
  <Clover.Viewer
    iiifContent={url}
    renderers={[{ format: ["model/gltf-binary"], component: ModelViewer }]}
  />
  ```

- **Animations.** A Canvas whose painting annotations are timed (`canvas#t=0,0.1`, one
  image per frame) plays as an animation, as 3.x's Viewer does: Cookbook-style 0688 (a
  stereo card's two eyes) and NUL's Muybridge plates (16 frames).
  - Read as a timeline: each frame shows until the next starts, the last until the
    Canvas's `duration` ends.
  - A frame bar, styled and fading with the media transport: a scrubber, previous and
    next (stopping at the ends), play or pause, Repeat, and "Frame 3 of 16".
  - `auto-advance` (Canvas or Manifest) plays on arrival, `repeat` sets Repeat, and a
    Manifest's `auto-advance` moves to the next Canvas when a non-repeating animation
    ends. Nothing autoplays for a reader asking for reduced motion. The Canvas takes
    `options.animation: { autoplay, loop }` on its own.
  - No blinking: every frame is in the scene from the start, its tiles loading, and a
    frame change only shows one and hides the rest, keeping the camera and the
    hotspots. A frame not yet loaded is not shown; the current one holds a beat longer.
  - The clock and bar load on demand; a Canvas that is not an animation never loads
    them.
- **A region cropped through an image service** is measured in the service's own size,
  not the body's declared one (Image API §4.1). A body declaring a cropped derivative's
  size while carrying the whole image's service (0688) showed a stretched sliver.
- **Annotations.** The comments, tags, transcriptions and descriptions on a Manifest's
  Canvases are listed in `Clover.Annotations` (and an Annotations tab when there are any)
  and drawn as hotspots on the Canvas.
  - Picking an entry frames it on the Canvas, moving to its Canvas first. Hovering an
    entry or its hotspot highlights both, through the Root, with no timers or polling.
  - Each set has a switch for its hotspots. HTML bodies are sanitised; image bodies
    (Cookbook 0377) show as images. Caption files are left to the media.
  - `annotations` on `Root` adds AnnotationPages or AnnotationCollections (followed from
    `first` through `next`), as URLs or objects.
  - The Canvas takes `selectedAnnotation`, `highlightedAnnotation` and
    `onAnnotationSelect`, so a host can drive its hotspots too.
  - Hotspots take the target's shape: a rectangle (`xywh`), a point (PointSelector, a
    marker that frames a 40-unit box when pressed, Cookbook 0135), or a shape
    (SvgSelector, drawn as itself and pressed only within it, Cookbook 0261). Shapes are
    redrawn from their geometry — `path`, `polygon`, `polyline`, `rect`, `circle`,
    `ellipse`, `line`, numeric attributes only — never from the selector's markup. The
    SVG reader (1.3 kB) loads only when a shape is in view.
- **Content state out.** `onContentStateChange` on `Root` reports where the reader is,
  as a IIIF content state (`{ json, encoded }`), whenever it settles after a move, a pan
  or zoom, or a pause or seek: the Canvas holding most of the view, and its region or
  the media time. `Clover.Share` copies a link carrying it in `iiif-content`, which a
  Root given that value opens at the same place. `buildContentState`,
  `encodeContentState` and `decodeContentState` are exported.

  ```jsx
  <Clover.Root
    iiifContent={url}
    onContentStateChange={({ encoded }) =>
      history.replaceState(null, "", `?iiif-content=${encoded}`)
    }
  >
  ```

- **Transcripts and chapters.**
  - `Clover.Transcript` lists the WebVTT captions of the video or sound in view, marks
    the cue playing (found by binary search) and seeks to a cue when it is pressed. With
    several caption files it offers a choice of language. It appears as a Transcript tab
    when the view's media has captions. Playback re-renders it only when the cue changes
    and writes nothing to the Root's state.
  - Captions and the transcript share one fetch of each file, read by Clover's own
    WebVTT parser (`parseVtt`, `cueAt`), with voice and styling tags handled.
  - Chapters come from the Manifest's Ranges (`chaptersOf`): notched on the transport's
    seek bar, listed in a Chapters menu that seeks, and named beside the time. `Canvas`
    takes them as `chapters` too.
  - Range items read correctly from `@iiif/parser` 4.0.3, whose upgrader turns a Range
    item's `#t=` into `/t=`.
- **`Clover.Contents`**, the Manifest's table of contents from its Ranges, nested as they
  nest (a single top Range is unwrapped, `no-nav` Ranges skipped). The entry the reader
  is in is marked with `aria-current`, following playback through a time-based Canvas;
  choosing one goes to its Canvas, region or moment. It is a Contents tab when the
  Manifest has Ranges. `tableOfContents()` and `currentContents()` give the same data to
  a part of your own.
- **`Map`**, from a third entry, `@nulib/clover/map`: where a IIIF resource is, on a map.
  - navPlace places on the Collection, Manifest, Canvases and annotations (and GeoJSON
    annotation bodies, Cookbook 0139), named by their label in the reader's language and
    drawn in the accent color or their own simplestyle.
  - Georeference Extension annotations, on a Canvas or an image service, drawn as the
    affine fit of their control points (exact for three), clipped to their mask. No
    Allmaps: no thin-plate spline or tiled overlay.
  - Standalone with `iiifContent`, `navPlace` or `georeferences`; inside a `Root` it maps
    the Root's resource and the view's georeferenced image, and pressing a place goes to
    its Canvas.
  - The Viewer, `Classic`, `Document` and a default `InformationPanel` add a Map tab by
    themselves when the Manifest, its Collection, a Canvas or an annotation has navPlace
    or a georeference. Nothing to pass.
  - `maplibre-gl` is a dependency, downloaded only when a map is first shown (about
    287 kB gzip); a Manifest without places never loads it. Import
    `maplibre-gl/dist/maplibre-gl.css` beside Clover's stylesheet. If your bundler moves
    MapLibre's files (Next and webpack do), serve its worker and call
    `setMapWorkerUrl(url)` once; a standalone `Map` also takes `workerUrl`. Wheel zoom is
    off by default.

  ```jsx
  import "maplibre-gl/dist/maplibre-gl.css";

  <Clover.Viewer iiifContent={url} />; // a Map tab when there are places
  ```

- **`Clover.Search`**, IIIF Content Search 1 and 2. A Manifest with a search service gets
  a Search tab: a field, then the hits listed by page with the words around each match
  (version 1's `hits`, version 2's TextQuoteSelectors), following further pages of
  results. The hits are drawn on the Canvas as their own annotation set
  (`SEARCH_SET_ID`), not listed among the Annotations; choosing one goes to its page and
  frames it. `Root`'s `searchQuery` searches as the Manifest opens (3.x's
  `iiifContentSearchQuery`), and `clover.search(query)` searches from your own part.
  Emptying the field clears the hits, and another Manifest starts without them.

  ```jsx
  <Clover.Viewer iiifContent={manifestUrl} searchQuery="bird" />
  ```

- **Collections.** A Collection's members are browsable within one `Root`.
  - `Clover.CollectionSelect`, a native `<select>` of the members labelled by the
    Collection, sits in the Viewer's and the Classic template's header. Choosing a
    Manifest shows it; choosing a nested Collection enters it.
  - `<Clover.Items of="members">` is the same choice as a listbox of thumbnails.
  - `Root` takes `manifestId` (controlled, with `onManifestChange`) to open and follow a
    member, and `clover.goToManifest(id)` moves there from a part of your own.
  - Paged Collections are followed from `first` through `next`.

  ```jsx
  <Clover.Root
    iiifContent={collectionUrl}
    manifestId={id}
    onManifestChange={setId}
  >
    <Clover.CollectionSelect />
    <Clover.Content />
  </Clover.Root>
  ```

- **Templates**, ready-made layouts from a second entry, `@nulib/clover/templates`,
  with their own stylesheet, `@nulib/clover/templates.css`. Each is built only from the
  package's public parts, so it can be copied into an app and changed.
  - `Classic`: Clover 3.x's Viewer layout. Title and Share above; the stage with the
    information panel to its right; the thumbnail strip under the stage, headed by the
    position and arrows.
  - `Document`: reads like a PDF viewer. A toolbar, page thumbnails down the left, and
    one whole page at a time: a scroll turns the page (one gesture, one page, past any
    trackpad momentum), as do PageUp and PageDown, and at either end the wheel scrolls
    the document on. The information panel slides out over the right of the page.
  - `Gallery`: a grid of the views that opens one in a lightbox (a native `<dialog>`)
    with the stage and the pager.
  - `Text`: a Manifest read as text, as 3.x's Scroll reads it. One article per Canvas,
    its image beside its annotations in a column per language, with a search and a
    lightbox.

  ```jsx
  import * as Templates from "@nulib/clover/templates";
  import "@nulib/clover/styles.css";
  import "@nulib/clover/templates.css";

  <Templates.Classic iiifContent={url} />;
  ```

- **`visuallyHidden`**, the inline styles Clover hides labels with, for parts of your own
  that must read plainly without the stylesheet.
- **Markdown annotation bodies** (`format: "text/markdown"`) are read as Markdown —
  paragraphs, emphasis, links, lists, footnotes — and sanitised like HTML. `Clover.Value`
  shows any language map (with `format`); `useAnnotationSets`, `useT` and `toPlainText`
  are exported; `Root` takes `annotationPages="all"` to fetch every Canvas's referenced
  annotation pages, not only the view's. `Thumbnail` takes any resource as `value`, and
  image attributes such as `alt`.
- **`Clover.Items`**, thumbnails of a sequence as a `carousel` (the default), `list` or
  `grid`. It succeeds 3.x's `Slider` and the Viewer's thumbnail strip.
  - Inside a `Root` it is a listbox of the Root's views, a spread as one item (and
    nothing at all for a single view): one tab
    stop, arrows to move, Enter or Space to select, and the selection follows the pager
    and stays in view — in a list or grid too, scrolling only the box it scrolls in,
    never the page. Arrows follow a right-to-left book.
  - On its own, given `iiifContent` or `items`, it lists a Collection's members as links
    to their `homepage`, with the Collection's label, summary and homepage link above.
    `onSelect(item, event)` hears each choice; `event.preventDefault()` keeps the reader
    on the page.
  - `filter` adds a search field; `renderItem` replaces an item's figure.
  - The carousel is the browser's own scrolling with CSS snap points, with no carousel
    library: wheel, trackpad, touch and keyboard all scroll it, and a mouse can drag it.
  - Thumbnails load lazily, asked of each image service at `thumbnailSize` (200 by
    default). A level 0 service's `info.json` is read for the sizes it lists. Video and
    sound show their duration.
  - Size it with `--clover-items-height`, `--clover-items-size` and `--clover-items-gap`.

  ```jsx
  <Clover.Root iiifContent={manifestUrl}>
    <Clover.Content />
    <Clover.Items layout="grid" />
  </Clover.Root>

  <Clover.Items iiifContent={collectionUrl} />
  ```

- **What `iiifContent` takes.** A URL, or a IIIF object in Presentation 2, 3 or 4: a
  Manifest, a Collection (its first Manifest is shown, or `manifestId`), a Canvas (its `partOf` Manifest,
  or a Manifest of one), or a content state as JSON or base64url. A content state opens
  at its Canvas, framing its region or seeking to its time, past any placeholder. Then
  comes `defaultCanvasId`, then the Manifest's `start`, then its first Canvas. `canvasId`
  with `onCanvasChange` makes the Canvas controlled.
- **One data shape: IIIF Presentation 4.** Everything is upgraded to Presentation 4 as it
  loads, with `@iiif/parser`'s upgrader, which is fetched only when something needs
  upgrading. Every part reads that one shape. `toPresentation4()` does the same for data
  you hold yourself. Referenced annotation pages are fetched when their Canvas is shown.
- **`request`** on `Root`: `{ credentials, headers, fetch }` for every request any part
  makes, including the Manifest, annotation pages, `info.json`, tiles, captions and HLS.
- **Hooks for parts of your own:** `useStatus`, `useManifest`, `useSequence`,
  `useVisibleCanvases`, `useActiveCanvas`, `useNavigation` and `useLocalized`. Each
  re-renders only when what it reads changes. The viewport and the media element are
  passed through channels, not state, so panning and playback re-render nothing.
  `createClover()` gives the same state without React.
- **Phones.** iPhone Safari can put a video full screen, but no other element. There, the
  Canvas offers no full-screen control for images, and a video's full-screen button opens
  the system player. That includes a video drawn into the canvas
  (`presentation: "texture"`). The same applies inside a frame that is not allowed full
  screen, where the button used to do nothing. Other browsers are unchanged.
- **Captions show once on iPhone.** iOS Safari turns a caption track on by the reader's
  caption settings, and drew its own copy of each cue in the picture, under Clover's. Every
  track now stays `hidden`. Clover draws the cues and fills the transcript.
- **Without the stylesheet**, the stage keeps its size, because its geometry is set inline.
  The exit full-screen button stays hidden until the page goes full screen, and icons keep
  their own size.
- **Server rendering.** `Root`, `Label` and `Items` render with `renderToString` when
  `iiifContent` is an object. Nothing reads `window` before the component mounts.
- **Checked in browsers.** Every change is checked in Chromium, WebKit and Firefox, in
  WebKit at iPhone size with touch, and on React 18 and 19. The checks include axe and a
  Manifest of 1,000 Canvases.

- **`Canvas` (experimental).** Clover's own 2D pan-and-zoom renderer for images, video
  and sound, drawn with WebGL2 and falling back to Canvas2D. It replaces OpenSeadragon
  and Vidstack, which this package does not use.

  ```jsx
  import * as Clover from "@nulib/clover";
  import "@nulib/clover/styles.css";

  <Clover.Canvas
    body={paintingBody}
    label="A letter"
    onReady={(canvas) => canvas.zoomBy(2)}
    onViewportChange={({ x, y, width, height }) => {}}
  />;
  ```

  It covers what 3.x `Image` does, apart from OpenSeadragon's own configuration:
  - **Image services.** IIIF Image API 3.0, 2.1.1 and 2.0, tiled from `tiles`, from a
    level 0 tree's `sizes`, or from tiles Clover cuts itself. Requests use each version's
    canonical URLs.
  - **Images and regions.** `body` and `src` arrays, `isTiledImage`, and `body.region`
    clips.
  - **Light on the network and the main thread.** While the view moves, tiles are
    fetched for where it will land rather than for each view on the way, and new tiles
    reach the GPU a few per frame, so a burst of them never stalls one.
  - **Annotation hotspots.**
  - **Controls:** the same cluster as 3.x `Image`, with `controlButtons`.
  - **Full screen, rotation and keyboard control**, and a **navigator** (an overview in
    the top left). Reset turns the image upright the short way: after four turns right
    it does not spin back a whole turn, and after three it turns one more quarter. The
    navigator is off by default; turn it on with `navigator`:

    ```jsx
    <Clover.Canvas src={src} isTiledImage navigator />
    ```

  - **For hosts.** The `onReady` handle gains `zoomToAnnotation(id)`, which zooms to a
    hotspot and focuses it, `fitCanvasRect(canvasId, rect)`, which frames a region of a
    shown Canvas, and `getCanvasRegion()`, the visible part of the Canvas filling most of
    the view in its own coordinates. `options.request` sets credentials, headers and
    `fetch` for every request the Canvas makes. `placeholder={false}` opens a Canvas past its placeholder,
    and children render after the controls in the cluster (a host's own controls).
  - **An annotations menu.** With `annotations`, a comment control in the cluster lists
    them by their text. Picking one zooms to it and keeps its hotspot highlighted, as
    clicking the hotspot does. `controls={{ annotations: false }}` hides it.
  - **A caption of Canvas information.** When a shown Canvas has a `summary` or
    `metadata` (Cookbook 0029, "metadata anywhere"), an `i` control in the cluster slides
    out a closable box over the picture with each Canvas's label, summary and metadata.
    `Canvas` renders as a `<figure>` (it was a `<div>`), and the box is its `<figcaption>`;
    the captioned Canvases' labels name the figure. Values keep IIIF's limited HTML,
    sanitised as 3.x's Primitives do, and the sanitiser loads only when the box first opens.
    `controls={{ information: false }}` hides it.
  - **Placeholder Canvases.** A Canvas with a `placeholderContainer` (Presentation 3's
    `placeholderCanvas`) shows its image first,
    fitted and centred, with a toggle in the top right (the Viewer's magnifier) to open
    the Canvas; clicking the image opens it too. Until then the Canvas is held back: no
    tiles, pan or zoom, annotations, `Choice`, or video and sound. The information control
    is not held back. The toggle goes back to the placeholder, and each new set of
    `canvases` starts from its placeholder. For video and sound the toggle is a large play
    button in the middle of the image, and opening starts playback; once open it is the
    close control in the top right, like the image's.

  It also draws IIIF Canvases, in Presentation 4: pass one, or the few shown together (a
  spread), as `canvases`. Upgrade older IIIF with `toPresentation4()` first. Inside a
  `Root`, given nothing to draw, it shows the Root's current view instead.
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
  <Clover.Canvas
    canvases={[leftPage, rightPage]}
    viewingDirection="right-to-left"
  />
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
    - **Poster.** A `placeholderContainer` image is the video's poster.
    - **HLS** plays through `hls.js` wherever the browser supports it, Chromium's native
      HLS included, and natively only where it does not (older iOS).
    - **Sound** plays through the same transport, over the
      accompanying (or placeholder) Canvas's image. It has no waveform.
    - **New props and options.** `onMediaElement` hands a host the element, and
      `onEnded` fires at the end. `options.media.presentation: "texture"` draws video
      frames into the WebGL canvas instead of positioning a `<video>`. This needs CORS,
      and a video without it falls back.

    ```jsx
    <Clover.Canvas
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

  A standalone `Canvas` is 33.0 kB of JavaScript gzipped, translations included, and the
  whole `Viewer` is 39.3 kB, plus 3.9 kB for the stylesheet. 3.x `Image` with
  OpenSeadragon is 121 kB. Video and sound add a separate 4.2 kB chunk, loaded only when
  a Canvas paints them. `hls.js`, DOMPurify and the Presentation 4 upgrader load only when
  needed. The budgets in `build/size-budget.json` were raised for `Root` (Canvas 34 kB)
  and then for `Items`, the information panel, annotations and transcripts (Canvas
  36 kB, Viewer 54 kB, stylesheet 5.8 kB), and again for Contents and Collections
  (Viewer 56 kB, Classic 55 kB), for the Document template's stylesheet
  (`templates.css` 2.2 kB), and for Content Search (Viewer 58 kB, Classic 57 kB, Document
  58 kB, stylesheet 6.2 kB). Search loads with the panel: split into a lazy chunk it
  measured larger, not smaller (Viewer 58.9 kB against 56.9). The Map tab adds 0.8 kB to
  the Viewer and 0.7 kB to a standalone Canvas: through esbuild, its lazy chunk splits
  the modules it shares with the parts into more chunks, each gzipped and wired on its
  own (the code itself is about 100 bytes). The Canvas budget was raised to 37 kB for it,
  and the Viewer's, Classic's and Document's by 1 kB for point and shape hotspots
  (0.4 kB on a Canvas, 0.5 kB on a Viewer, the SVG reader itself loading on demand),
  then each by 1 kB for animations (0.8 kB on a Canvas: frame detection and the
  renderer's `setHidden`/`isReady`, the clock and bar loading on demand), and by 1 kB
  for Download and renderers (Viewer 0.7 and 0.4 kB; the stylesheet's budget to 6.5 kB).
  The Canvas budget was raised to 38.5 kB for full screen on iPhone (0.5 kB: the check
  for whether an element can go full screen, and handing a video, even one drawn into the
  canvas, to the system player).
  MapLibre is 286.8 kB on a map (budget 300 kB), and `@nulib/clover/map` 17.4 kB before
  it (budget 20 kB). The whole Viewer, everything included, is 60.2 kB, a standalone
  Canvas 37.6 kB, the Classic template 59.0 kB, the Document template 60.0 kB, the
  stylesheet 6.3 kB and `templates.css` 1.8 kB. Bundled through the package entry with esbuild, a
  standalone Canvas measures 34.7 kB; imported directly it is 32.9 kB, as Rollup bundles
  it.

  The API is experimental and may change in any release.
