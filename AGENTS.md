# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, with publishable entry points inside `components/{Image,Primitives,Scroll,Slider,Viewer}` plus shared utilities in `lib/`, `hooks/`, `context/`, `i18n/`, and `web-components/`. Docs are powered by Nextra/Next in `pages/` and `docs/`, build artifacts land in `dist/`, static assets go in `public/`, and tests sit beside the code they cover as `ComponentName.test.tsx`.

## Build, Test, and Development Commands
Use `npm run dev` to spin up the docs site at `http://localhost:3000` while iterating on components, and `npm run build` to produce the Vite library bundle in `dist/`. `npm run build:docs` compiles the Next.js docs, `npm run test` plus `npm run coverage` exercise Vitest with HTML/JSON reports, and `npm run lint` / `npm run typecheck` gate formatting (Prettier + `next lint`) and TypeScript checks respectively.

## Coding Style & Naming Conventions
The codebase is TypeScript-first with React for docs and Preact for the web-component build; keep components in PascalCase `*.tsx`, utilities in camelCase `*.ts`, and exported hooks prefixed with `use`. Run `npm run prettier:fix` before committing, honor ESLint (`next/core-web-vitals`, `@typescript-eslint`), and rely on the `vite-tsconfig-paths` aliasing to avoid brittle relative imports. All CSS decisions must follow `skills/css-styling.md`—backgrounds and other colors always use design tokens and should only apply when contrast demands it.

## Testing Guidelines
Vitest with the JSDOM environment (initialized in `src/setupTests.ts`) is the required test harness, so prefer Testing Library patterns that read like user actions. Co-locate specs with their targets (`Viewer.test.tsx`, `manifest.util.test.ts`), avoid DOM snapshots when a query + assertion suffices, and track coverage via `npm run coverage` to keep the v8 reports healthy.

## Commit & Pull Request Guidelines
Branch from `main`, keep changes scoped, and write imperative commit messages such as `Fix slider scroll behavior` or `Docs: clarify IIIF setup`; reference GitHub issues as `#123` when applicable. PRs must describe the change, link issues, include screenshots or GIFs for UI shifts, and pass `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before requesting review.

## Environment & Tooling
Develop against Node `20.5.0` (`.tool-versions`), allow Husky/lint-staged to run format + lint hooks, and verify third-party IIIF manifests for CORS when testing in examples. When publishing, double-check that `dist/` contains the expected modules and that docs previews reflect the new behavior.

## Skills Directory
Reference `skills/` whenever you need deeper implementation guidance. Currently, `skills/css-styling.md` defines how every component consumes design tokens (no hardcoded backgrounds, minimal defaults, CSS variables for overrides); expand this directory with future skills so agents have a single source for repeatable decisions.
