# Design: space, type and selectors

How `@nulib/clover` sizes everything it draws, and how its stylesheet is written. This is
a rule, not a guideline. `src/styles/scale.test.ts` enforces the parts a test can check;
the rest is review.

The aim is natural whitespace. Space between things should say how closely they belong
together, so a reader can see the structure before reading a word. Every value comes
from one scale, and the scale comes from the page Clover sits in.

## 1. Clover takes its size and type from the page

- **No font family, ever.** Not on a part, not on a button, not anywhere. Type is the
  page's.
- **No base size.** No part sets a `font-size` on itself to restyle its text, and no part
  sets a `line-height`. The panel, the caption box and the menus read at the page's own
  size and leading.
- **`1rem` is the page's.** Clover's unit is the page's root size, so a reader who
  enlarges text enlarges Clover with it.
- **Controls inherit too.** Browsers give buttons, inputs, selects and textareas their own
  font. One rule in `src/styles/scale.css` hands them the page's
  (`:where(...) :where(button, input, select, textarea) { font: inherit }`). It has no
  specificity, so any part's own size wins.

## 2. The scale

Every space is a step of the golden ratio (φ ≈ 1.618) from `1rem`. Every step is a
custom property on `:root` in `src/styles/scale.css`. They have no literal fallbacks:
the stylesheet that uses them defines them, and a page may override any of them.

| Token                | Value    | At 16px | Step |
| -------------------- | -------- | ------- | ---- |
| `--clover-space-3xs` | 0.146rem | 2.3px   | φ⁻⁴  |
| `--clover-space-2xs` | 0.236rem | 3.8px   | φ⁻³  |
| `--clover-space-xs`  | 0.382rem | 6.1px   | φ⁻²  |
| `--clover-space-s`   | 0.618rem | 9.9px   | φ⁻¹  |
| `--clover-space-m`   | 1rem     | 16px    | 1    |
| `--clover-space-l`   | 1.618rem | 25.9px  | φ    |
| `--clover-space-xl`  | 2.618rem | 41.9px  | φ²   |
| `--clover-space-2xl` | 4.236rem | 67.8px  | φ³   |

**Type** steps by √φ, half a step of the same scale. A whole step down (0.618rem) is too
small to read.

| Token              | Value    | At 16px | Use                                                                                         |
| ------------------ | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `--clover-text-s`  | 0.786rem | 12.6px  | Secondary text: times, formats, captions under thumbnails, labels of metadata, menu legends |
| (inherited)        | 1rem     | 16px    | Everything else. Headings inside parts use the page's size, set apart by weight             |
| `--clover-text-l`  | 1.272rem | 20.4px  | Titles: a layout's title, Items' title, the lightbox's                                      |
| `--clover-text-xl` | 1.618rem | 25.9px  | An error headline                                                                           |

**One derived size.** `--clover-control` is a 1rem icon with `s` on every side,
`calc(1rem + 2 * var(--clover-space-s))`, 2.236rem. Every round control is this size.

**Derived places** are sums of steps, written out with `calc()` so the reasoning shows:

- "Below the cluster": `calc(var(--clover-space-m) + var(--clover-control) + var(--clover-space-s))`.
  That is the cluster's inset, one control and the gap after it. The caption box, a
  placeholder's toggle and the navigator in full screen all sit there.
- `--clover-transport-room` (`Transport.css`, on `.clover-canvas`) is what the media bar
  takes up: one control, the seek row (`l`), `xs` between them and `m` above and below.
  Captions and the caption box clear it.

## 3. Adjacency: the step comes from how closely things belong together

The closer two things are related, the smaller the step between them. A container's
inset is one step larger than the gap between the things it holds. Work from the top
down: decide the outer level first, then step down for each level inside it.

| Relationship                                         | Step  | Examples                                                                                                                                                            |
| ---------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate groups in one list                          | `l`   | Annotation sets                                                                                                                                                     |
| Items that are each a group                          | `m`   | Thumbnails in any layout of Items (each a picture with its caption)                                                                                                 |
| A region and what is next to it; a container's inset | `m`   | A layout's header and thumbnail strip, each padded all round; the cluster's and the transport's inset from the stage; the panel's inset; About's sections           |
| Siblings within one region                           | `s`   | Header actions; cluster buttons; transport buttons; a strip's Position and arrows over its thumbnails; a row's inline padding                                       |
| Parts of one control or one item                     | `xs`  | A thumbnail and its caption; a label and its select; a search field and its button; the seek row over the bar; an icon beside a pill's label; a row's block padding |
| Rows of one list; a heading over its value           | `2xs` | Rows of annotations, Ranges, cues and hits; the tabs in their row; boxes of the accordion; a metadata label over its value                                          |
| Lines of one caption                                 | `3xs` | A thumbnail's label and summary                                                                                                                                     |

Worked examples, from the top of the Viewer down:

- **A layout** (the Viewer's `Default`): the header and the thumbnail strip are regions, each
  `m` inside all round. Each holds its own space, so nothing around them needs a margin.
  The header's title and actions are `s` apart. The strip's Position and arrows are `s`
  over its thumbnails, the arrows `xs` apart and the position `s` from them.
- **The Canvas's controls**: the cluster sits `m` in from the stage's top and end, with
  its buttons `s` apart. Each is one `--clover-control`. A placeholder's toggle takes a
  control's place beside it, `s` away.
- **The media bar**: `m` in from the stage's sides and bottom, with `xl` of scrim above.
  The seek row is `xs` over the bar, since they are one control. The bar's controls are
  `s` apart, as the cluster's are.
- **The information panel**: `m` inside. A tab is `xs` by `s`, the tabs `2xs` apart, and
  the open tab's content `m` below the row. An accordion box's heading is `s` inside, the
  boxes `2xs` apart, and the content under its heading `s` in.
  - The close control sits `xs` in from the corner. It reaches `xs + control = 2.618rem`
    in, which is `l` past the panel's `m`. So the tab row keeps `l` clear for it, and the
    sums land back on the scale.
- **Menus over the Canvas**: `xs` inside, options `xs` by `s`, groups `s` apart.
- **Items**: each item is a group, so items are `m` apart, one step over their insides: a
  picture `xs` over its label, a caption's lines `3xs` apart, in `text-s`. An item holds
  a card per Canvas, and the Manifest's `behavior` decides what an item holds: the cards
  of a spread (`paged`) or of a `continuous` Manifest are one item, stitched with no gap
  (`0`), each with its own label under its own picture.

When a new part does not fit a row of the table, place it by asking what it belongs to,
not by eye.

## 4. Selectors: few, structural, written once

The stylesheet's size is part of the design.

- **One class names a component.** Its insides are selected by structure under it: the
  semantic elements it renders (`.clover-about dl`, `.clover-canvas-menu legend`,
  `.clover-canvas-caption dt`). Do not add a class for each element. Keep the classes
  that state a role the HTML cannot, such as `-label`, `-summary` or `-current` states,
  and the classes tests or hosts rely on.
- **Families are written once**, as one `:is()` list over their members, and each member
  keeps only what is its own:

  | Family               | Where                  | Members                                                                                     |
  | -------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
  | Round controls       | `ui/Button.css`        | the Canvas's cluster, the media transport, the thumbnails' scroll arrows, the panel's close |
  | Pills                | `ui/Button.css`        | Previous and Next, Download, a search's submit                                              |
  | Rows and their lists | `InformationPanel.css` | annotations, Ranges, cues, search hits                                                      |
  | Fields               | `styles/scale.css`     | a search's query, a Collection's menu, a filter, a transcript's track menu                  |

  A family meant to be refined by its members is `:where()`, with no specificity. A
  family that sets a look its members keep is `:is()`.

- **`button.x`, not `.x`.** One class ties with a reset's `[type="button"]`. The element
  type breaks the tie whichever stylesheet loads last.
- **Everything is in `@layer clover`**, so a page's own unlayered rules win.

## 5. What is not on the scale

Some values are not space between things, and stay as they are:

- **Dimensions**: stage heights (`--clover-content-height`), panel widths and their
  bounds, thumbnail heights, menu widths. Use the scale where a dimension is really a
  space; the navigator, for example, is a golden rectangle, `2xl + xl` by `2xl`.
- **Hairlines**: borders, outlines, focus rings, slider rails and thumbs, at most 4px.
- **Breakpoints**, percentages and viewport units.

## 6. Adding or changing a style

1. Name the component's root class; select its insides by structure.
2. Is it a member of a family? Add it to the family's list and keep only what differs.
3. For each space, ask what the two things belong to and take that step (§3). For a
   place, add up steps with `calc()`.
4. Leave its text at the page's size, or use `--clover-text-s` / `--clover-text-l`.
   Never set a font family or a line height.
5. Run `npx vitest run src/styles`. It fails on a literal rem or em in a spacing, inset
   or font-size declaration, on pixel spacing above a 4px hairline, and on any font
   family. Then check the stylesheet's size in `npm run test:build`.
