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

## Environment & Tooling
- Node: `20.5.0` (see `.tool-versions`).
- Husky/lint-staged run formatting and lint checks on commit.
- When working with IIIF resources, verify CORS in local examples.
