# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/` with key modules:
  - `components/{Image,Primitives,Scroll,Slider,Viewer}`: published entry points.
  - `lib/`, `hooks/`, `context/`, `i18n/`, `web-components/`.
- Documentation site uses Next.js/Nextra in `pages/` and `docs/`.
  - The docs lead with Clover 4, `@nulib/clover` (`packages/clover`): its pages are
    `pages/docs/*` (URLs `/docs/…`), and the homepage shows it. Clover 3.x,
    `@samvera/clover-iiif`, is kept at `pages/docs/3.x/` (URLs `/docs/3.x/…`), one
    sidebar group titled "Clover 3.x", collapsed, under "Earlier versions" at the bottom.
    Its page titles end in "(3.x)" so search results tell the two apart.
  - Keep 3.x as a nested group, not flattened with `"display": "children"`: Nextra 2
    keys sidebar items by file name, so a flattened `3.x/viewer` collides with 4.x's
    `viewer` and drops out of the sidebar.
  - Links inside 3.x pages point within `/docs/3.x/`. Keep 4.x features out of the 3.x
    pages, and 3.x's API out of the 4.x ones. `Canvas` is documented in 4.x only.
  - The site is a static export, so there are no server redirects. URLs that moved
    (3.x pages from `/docs/…`, 4.x pages from `/docs/4.x/…`) are sent on by the 404
    page, `pages/404.mdx`, from the table in `docs/components/Moved.tsx`. Move a page
    again, and add its old URL there. A 3.x page whose name 4.x now uses (`viewer`,
    `map`) shows the 4.x page, which links to its 3.x version.
  - How to compose a layout (`Root`, the parts, the property parts, the information
    panel's `Tab`s, `Split`, hooks, renderers, styles) lives on one page,
    `pages/docs/composing.mdx` ("Composing Layouts", under Templates). The Viewer page
    covers what the Viewer handles and links there; add composition material there, not
    to the Viewer page.
  - `/docs/viewer/demo` is Clover 4's demo: the field, featured items, and every IIIF
    Cookbook recipe to open, handled or not (`docs/components/Clover4/CookbookDemo.tsx`).
    iiif.io's recipe pages link to it as `…/docs/viewer/demo?iiif-content=<manifest>`, so
    never move it without leaving the 404 table a forward. `/docs/viewer/progress` is
    unlisted (hidden in the sidebar, out of search): each recipe's status in 4.x beside
    3.x, and what is missing. Its data is `docs/components/CookbookRecipes/progress4.ts`;
    when a recipe starts working, or stops, record it there with the date.
  - The site banner (`theme.config.tsx`) says Clover 4 is in development. Retire it, or
    change its `key`, when 4.0 ships.
  - The homepage (`docs/components/Home/`) opens with its headline, "Create your own
    viewer." (`Hero.tsx`, the page's `h1`), and one sentence on what Clover does for the
    distinctive collections a library, archive or museum shares (an accessible, curated
    viewer designed for its IIIF Manifests and Collections). It has two
    halves: the templates live under it (`docs/components/Playground/`), and below them,
    well apart, the same resource shown one IIIF property at a time by the components the
    templates are made of (`Parts.tsx` and `PartsLive.tsx`), opened by one call to action,
    with no heading of its own. It follows the playground: `Homepage` holds the resource the
    playground reports (`onResourceChange`) and hands it down, and the section's chips
    put another of the playground's resources on its stage (`pickResource`).
  - That section is one `Root` for that resource. On the left its parts make a small
    viewer, held in view; on the right each part is a tile, live, named as it is written
    (`<Clover.Label />`), with the property it reads and a fact from the resource (a
    count, a size, a name). Pointing at a tile outlines the part in the viewer. A part
    the resource gives nothing to is a chip at the end, naming what it would read and the
    playground resource that has it (`SHOWN_IN`). Every value shown is the resource's
    own: no illustrations, made-up figures or copy. Golden-ratio spaces, hairline edges,
    no grey fills.
  - The playground shows how far one Viewer stretches: any layout with any kind of
    resource. Two pickers sit over one stage, each changing without the other: the
    resources as thumbnails, centred and unlabelled (`resources` in
    `playground-config.ts`: a catalog, a print, a Collection, a photo, a map, a film, a recording…,
    plus "Your own"; their group is named "Select a IIIF resource" for assistive technology),
    and at the end of the bar a "Template" dropdown listing the templates by name. No
    drawings of the layouts, no fills of light grey, spaces on Clover's golden-ratio
    scale. Each template shows with its own defaults: no props, no generated code (a
    Customize drawer with both was removed on purpose). The section is wider than the
    reading sections but held off the screen's edges; the stage keeps one height for
    every pairing, with a hairline edge and a small, soft grey shadow (never the accent).
    Keep it about layout and UX: names, not descriptions or marketing lines.
  - Headers are solid, never frosted or translucent: the navbar (`docs/styles/layout.css`
    overrides Nextra's blur) and the playground's bar. From 80rem, where the bar is one
    row, it holds under the navbar as its lower half: while the stage passes under, the
    navbar's edge moves to the bar's foot, and the bar's foot rides on the stage's as the
    two leave. `useStuck` writes `data-stuck` to the bar directly, not to state, so this
    never re-renders the stage.
  - The homepage renders on the server, so a component it imports statically must not
    import `@iiif/helpers` (through `docs/lib/iiif-content`, say). It is an ESM external
    there, which makes the importing module async, and the homepage's import of it is
    then undefined ("Element type is invalid").
  - `/test/…` (`pages/test/`) holds unlisted mocks of host pages, for trying Clover 4
    where it is meant to live: raw layout, no docs navbar or footer, out of search.
    `/test/dc-item` is a Digital Collections item page (`docs/components/DcItemMock/`),
    filled from the DC API, with the Viewer and `Items` where the site has 3.x's Viewer and
    Slider; `?id=<work id>` opens another work, and a row's works open in the mock.
- Build output goes to `dist/`; static assets in `public/`.
- Tests are colocated near code as `*.test.ts|tsx` (see `vitest.config.mjs`).

## Build, Test, and Development Commands

- `npm run dev`: start the docs site locally at `http://localhost:3000`.
- `npm run build`: build the library (Vite-based, writes to `dist/`).
- `npm run build:docs`: build the Next.js docs site. Not while `npm run dev` is running:
  both write to `.next/`, and the build leaves the dev server failing with "Cannot find
  module './NNNN.js'". Stop the dev server first, or after a build clear `.next/` and
  restart it.
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

## Packages

- `packages/clover` is `@nulib/clover`, the composable 4.x Clover, as an npm workspace.
  It is private and unpublished. Its own rules are in `packages/clover/AGENTS.md`.
- `@samvera/clover-iiif` (the root) stays the 3.x line. The two never import each other:
  ESLint forbids it both ways, the package's build rejects undeclared imports, and
  `build/player-chunks.test.mjs` asserts that no 3.x build carries package code.
- `Canvas` and its renderer live only in the package. 3.x draws with OpenSeadragon and
  Vidstack, and keeps its Player and waveform.
- 3.x's Slider and the Viewer's thumbnail strip scroll natively through
  `src/components/Shared/Track/useTrack.ts` (CSS scroll snap, paging, mouse drag), a copy
  of the package's `useScrollTrack`. Embla was removed; do not bring a carousel library
  back.
- The 3.x Viewer talks to OpenSeadragon through `ViewportAdapter`
  (`src/lib/viewport-adapter.ts`): `zoomToAnnotation(id)`, `getVisibleRegion()`,
  `onViewportChange()`, `markContentState()`. Read it with `useViewportAdapter()`, which
  derives it from `openSeadragonViewer`. New Viewer code should use the adapter rather
  than `openSeadragonViewer`, which stays in state for plugins. `viewport-adapter.ts` must
  not import OpenSeadragon at runtime, since `viewer-context` imports it.

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

## Mocks

- Complex, reusable IIIF mocks are published, not kept private to a test. Each has one
  generator in `docs/mocks/<name>/` and three outputs that must agree:
  - static files in `public/mocks/<name>/`, written by `npm run build:mocks`
    (`scripts/build-mocks.mjs`, run with vite-node) and committed, published with the
    docs at `https://samvera-labs.github.io/clover-iiif/mocks/<name>/`;
  - a live copy for `npm run dev` under `pages/api/mocks/<name>/`, ids under the dev
    server and CORS open;
  - where the static site cannot answer (a search's `?q=`), a `mockFetch` the docs demos
    pass as `request.fetch`.
- Document every mock on `pages/docs/mocks.mdx` (URLs, contents, example answers, how to
  regenerate, rights). `public/mocks` is in `.prettierignore`; regenerate, don't hand-edit.
- `next.config.js` applies `output: "export"` only outside `next dev`: an export turns
  API routes off in development too, which had silently broken the 3.x
  `/api/fixtures/content-search` mock.
- Current: `content-search`, a two-page newspaper with line and word OCR (`xywh`,
  `textGranularity`) and a Content Search 2.0 service; `georeference`, Northwestern's
  Evanston township map with a stored georeference annotation and a navPlace (static);
  `tagging`, Northwestern's record of a Curtis photogravure, kept as fetched in
  `source.json`, with the words printed on the plate tagged where they sit (Cookbook 0021) and its Caption moved from the Manifest's `metadata` to the Canvas's `summary`
  (static). It is the playground's Print;
  `navplace`, Northwestern's record of a Sullivan slide of a Chicago bus, kept as fetched,
  with a navPlace point at the corner its summary names (static), the playground's
  Photo; `paged`, Northwestern's record of the White Sewing Machine Company's 1896 bicycle
  catalog, a `paged` Manifest kept as fetched, with its double-page plate (Page 15)
  `facing-pages`, so it stands alone and Page 16 and Page 17 share a spread (static), the
  playground's Catalog.
- The Map Component section below is 3.x's. The 4.x map is `@nulib/clover/map`; its
  rules are in `packages/clover/AGENTS.md`.

## Environment & Tooling

- Node: `20.5.0` (see `.tool-versions`).
- Husky/lint-staged run formatting and lint checks on commit.
- When working with IIIF resources, verify CORS in local examples.
