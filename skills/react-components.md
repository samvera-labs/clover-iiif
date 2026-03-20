# React Component Skill

## Purpose
Keep React components simple, semantic, and easy to scan. Prefer JSX that mirrors the DOM structure rather than abstract `React.createElement` calls.

## Principles
- **JSX first:** Use JSX for all component return values. Reserve `React.createElement` for framework-level utilities and never inline it inside leaf components.
- **Semantic elements:** Choose HTML elements that match the content (e.g., `dl` for metadata pairs, `ul/li` for lists, `figure/figcaption` for media). Avoid generic `div` wrappers when a semantic tag exists.
- **Readable branching:** When a component needs to switch tags (e.g., `ul` vs `ol`), assign `const List = (as ?? "ul") as React.ElementType;` and return `<List>...</List>`. This keeps conditional JSX easy to scan, as shown in `PartOf`’s use of a `List` alias.
- **Readable structure:** Keep markup flat and legible. Compose from small helpers instead of nesting ternaries or passing JSX strings through helper functions.
- **Props over mutations:** Derive attributes (`className`, `style`, ARIA props) via normal JSX props. When optional wrappers are needed, branch the JSX, don't manipulate React internals.
- **Token + CSS separation:** Styling lives in CSS (vanilla-extract) classes; JSX simply applies class names. Avoid inline styles except when absolutely necessary (e.g., dynamic measurements).
- **Testing hooks:** Prefer `data-*` attributes for test selectors rather than component names.

## Review Checklist
- Is every component returning JSX instead of `React.createElement`? ✅
- Are we using the most appropriate semantic element for each block? ✅
- Do semantic alias variables (`const List = ...`) keep the JSX readable? ✅
- Do conditional branches stay readable (no nested `createElement` gymnastics)? ✅
- Are styles applied via class names or CSS variables rather than inline objects unless required? ✅
- Do data attributes and ARIA props maintain accessibility without extra wrappers? ✅
