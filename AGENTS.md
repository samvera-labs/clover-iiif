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
- Default tile provider: CARTO Positron — `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`, attributing both OpenStreetMap and CARTO. `expandTileUrls(url)` expands the `{s}` subdomain placeholder into the array of URLs MapLibre expects, so a `{s}` URL is fine here (and in any `tileLayer` a consumer passes).
- Wheel/trackpad zoom is **off** by default (`scrollZoom: false`), matching the `scrollToZoom: false` Clover sets for OpenSeadragon, so an embedded map cannot swallow page scroll. Do not re-enable it as a default.
- The accent color for markers is resolved with `resolveCloverColor()` rather than read from a token at build time: MapLibre paint properties go to WebGL, which cannot parse `var()`. It resolves once when the map becomes ready, so a token changed later will not repaint existing layers.
- Stable layer ID constants are defined at the top of `src/components/Map/index.tsx` (`NAVPLACE_SOURCE`, `WARPED_LAYER_ID`, etc.).
- MapLibre feature properties with nested objects (`iiifResource`, `label`, `summary`) are JSON-stringified in event handlers; use `parseMaplibreFeature()` to re-parse them.
- Tests must mock `maplibre-gl` and `@allmaps/maplibre` in any test file that imports a component which (transitively) imports Map — including `InformationPanel.test.tsx`. The mock fires the `load` event synchronously.
- Docs examples at `pages/docs/viewer/map.mdx` use `informationPanel: { open: true, defaultTab: "manifest-map" }` to show the panel open on the Map tab.
- `Map` is a composable standalone component, just as `Image` is. The Viewer wraps both — but consumers can use `Map` directly outside the Viewer. Keep this composability in mind when changing either component's props or internals.

## Environment & Tooling

- Node: `20.5.0` (see `.tool-versions`).
- Husky/lint-staged run formatting and lint checks on commit.
- When working with IIIF resources, verify CORS in local examples.
