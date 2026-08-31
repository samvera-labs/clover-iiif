/**
 * Clover's breakpoints, for the JavaScript side.
 *
 * These lived in `stitches.config.tsx` as the `media` map, where Stitches read them for
 * `@sm`-style conditions in style objects. The stylesheets state their own `@media` queries
 * now, so this exists for the one place a breakpoint has to be known in JS —
 * `useMediaQuery(media.sm)` deciding whether the Viewer is on a small viewport.
 *
 * The values are duplicated by every `@media` query in Clover's CSS, which no stylesheet can
 * read from here. `media.test.ts` asserts the two agree, so a change on one side that is not
 * mirrored on the other fails rather than quietly splitting the layout breakpoint from the
 * behavioural one.
 */
export const media = {
  xxs: "(max-width: 349px)",
  xs: "(max-width: 575px)",
  sm: "(max-width: 767px)",
  md: "(max-width: 991px)",
  lg: "(max-width: 90rem)",
  xl: "(min-width: calc(90rem + 1px))",
};
