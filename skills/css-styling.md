# CSS Styling Skill

## Purpose
Ensure every UI surface reads design tokens rather than hardcoded values. This keeps colors themeable through CSS variables and avoids opinionated defaults that leak into host applications.

## Principles
- **Token-first:** Backgrounds, borders, typography, spacing, radii, and shadows must reference `vars` from `src/styles/theme.css.ts` (or their `var(--clover-*)` equivalents). No literal hex, hsl, rgb, or pixel radii.
- **Simplify surfaces:** Remove decorative drop shadows entirely; rely on spacing, borders, or layout to create separation.
- **Client overrides:** Always expose values via CSS custom properties so downstream apps can override `--clover-*` at runtime. Never bake colors into component logic.
- **Minimal defaults:** Only set background colors when they are required for contrast, focus rings, or overlays. Otherwise inherit from the parent surface so embedders control the look.
- **Contrast contract:** Tokens must cover `foreground`, `background`, and `accent`. Use `accent` exclusively for actionable/interactive elements (links, buttons, OpenSeadragon annotations that respond to hover/focus) and ensure it meets WCAG 2.1 contrast ≥ 4.5:1 against `foreground`.

## Implementation
1. Import the Vanilla Extract contract where styles are defined: `import { vars } from "src/styles/theme.css";`.
2. Reference tokens in rules, e.g. `backgroundColor: vars.colors.background` or `color: vars.colors.foreground`. Radii come from tokens like `vars.radii.sm`; never hand-type pixel values.
3. Omit `boxShadow` unless it serves an accessibility purpose (and if so, replace with a tokenized outline). Decorative drop shadows are not allowed.
4. When interacting with runtime styles (e.g., inline `style` props), prefer CSS variables: `style={{ '--clover-overlay-bg': vars.colors.background }}` or set them via class selectors.
5. If a component needs a new semantic color, add it under `foreground`, `background`, or `accent` families in `src/styles/design-tokens.ts`, regenerate any Tokenami outputs, and document the intent. Avoid sprinkling bespoke hues.
6. Do not apply global resets or body backgrounds from within components. Instead, scope necessary surfaces (e.g., toolbars, annotation pills) and keep the palette narrow.

## Review Checklist
- Backgrounds, borders, radii, and text all come from tokens? ✅
- Are there unnecessary solid fills that could inherit? If yes, remove them.
- Are shadows eliminated or replaced with tokenized outlines? ✅
- Is `accent` only applied to actionable/interactive elements (e.g., CTA buttons, annotation overlays in OpenSeadragon) and meeting WCAG 2.1 contrast ≥ 4.5:1 against `foreground`? ✅
- Do new tokens make sense for other components? If not, reconsider their addition.
- Tests/docs updated when token behavior changes.
