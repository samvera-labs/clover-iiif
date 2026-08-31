/**
 * Merge class names, dropping anything empty.
 *
 * Every component sets its own `clover-*` class and merges whatever `className`
 * it was handed, rather than letting one replace the other. That is what lets a
 * host add a class of its own — the Slider's filter field is both
 * `.clover-search-input` and `.clover-slider-search-input` — and what lets a
 * consumer style a component without erasing it.
 *
 * It also carried the move off Stitches: while both styling systems were live, a
 * `styled()` wrapper's generated class arrived here as `className` and landed
 * alongside Clover's own, which is what made converting one directory at a time
 * possible.
 */
export const join = (...names: Array<string | undefined | false>) =>
  names.filter(Boolean).join(" ");
