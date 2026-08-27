/**
 * IIIF layout behavior, and how it groups items into slides.
 *
 * The Presentation 3.0 spec defines behavior values in disjoint sets, of which only the
 * *layout* set decides how a sequence is laid out: `unordered`, `individuals`,
 * `continuous` and `paged`. Those are the four a carousel can act on, so they are the
 * four in the enum.
 *
 * `facing-pages` and `non-paged` are deliberately absent. They are layout behaviors too,
 * but they qualify an individual Canvas rather than the resource — "this canvas is itself
 * a spread", "never pair this one" — so they belong to per-item handling, not to a prop
 * that describes the whole sequence.
 *
 * The temporal (`auto-advance`, `repeat`), collection (`multi-part`, `together`), range
 * (`sequence`, `thumbnail-nav`, `no-nav`) and miscellaneous (`hidden`) sets say nothing
 * about layout and are ignored here.
 *
 * @see https://iiif.io/api/presentation/3.0/#behavior
 */
export type SliderBehavior =
  | "individuals"
  | "paged"
  | "continuous"
  | "unordered";

const LAYOUT_BEHAVIORS: SliderBehavior[] = [
  "individuals",
  "paged",
  "continuous",
  "unordered",
];

/**
 * The behavior to lay out by.
 *
 * An explicit prop wins, then whatever the resource declares, then `individuals` — the
 * spec's own default, and the only safe assumption for a sequence that says nothing.
 *
 * `behavior` arrives as an array on a well-formed resource but is tolerated as a bare
 * string, and may carry values from other sets alongside the layout one, so the first
 * recognised layout value is taken rather than the first value.
 */
export const resolveBehavior = (
  declared: unknown,
  override?: SliderBehavior,
): SliderBehavior => {
  if (override) return override;

  const values = Array.isArray(declared)
    ? declared
    : typeof declared === "string"
      ? [declared]
      : [];

  const match = values.find(
    (value): value is SliderBehavior =>
      typeof value === "string" &&
      LAYOUT_BEHAVIORS.includes(value as SliderBehavior),
  );

  return match ?? "individuals";
};

/**
 * Split a flat list into slides.
 *
 * Only `paged` changes the shape: it pairs items, leaving the first alone so a book opens
 * on its cover and every later slide is a recto/verso spread — the convention the spec
 * describes and the Viewer already follows.
 *
 * `continuous` keeps one item per slide. It means the items form a single unbroken
 * object, which a carousel expresses by closing the gutter between them rather than by
 * regrouping; see `Items`.
 */
export const groupItemsByBehavior = <T>(
  items: T[],
  behavior: SliderBehavior,
): T[][] => {
  if (behavior !== "paged") return items.map((item) => [item]);

  const slides: T[][] = [];
  items.forEach((item, index) => {
    if (index === 0) {
      slides.push([item]);
      return;
    }
    const last = slides[slides.length - 1];
    if (last.length < 2 && slides.length > 1) last.push(item);
    else slides.push([item]);
  });
  return slides;
};
