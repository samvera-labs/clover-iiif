# Custom A/V player — handoff for review

Branch `custom-av-player` · PR [samvera-labs/clover-iiif#367](https://github.com/samvera-labs/clover-iiif/pull/367)

Replaces the Viewer's bare `<video controls>` with a Clover-styled transport bar built on
[Vidstack](https://vidstack.io/docs), driven by the Manifest. Written against the plan in the PR
description; this document covers what landed, how it was verified, and what is still open.

---

## 1. State of the branch

|                                |                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Commits ahead of `origin/main` | 2 — `9b037553 Introduce custom A/V component.`, `b486ede3 Refine.`                                                     |
| Commits behind `origin/main`   | 2                                                                                                                      |
| Uncommitted                    | 18 modified files, ~840 insertions / 218 deletions                                                                     |
| Untracked                      | `src/components/Map/maplibre-worker.generated.ts` (generated; `main`'s `.gitignore` covers it, this branch's does not) |
| Total vs `origin/main`         | 45 files, ~4,362 insertions / 441 deletions                                                                            |

Per `AGENTS.md` no agent commits were made. The working tree holds the most recent round of fixes
and needs a human commit.

### Blocker before merge

**`origin/main` must be merged in.** Main moved `maplibre-gl` 5 → 6 and changed the import style.
`node_modules` already has 6.11.1, so this branch's `Map/index.tsx` fails typecheck:

```
src/components/Map/index.tsx(18,13): Module 'maplibre-gl' has no default export
src/components/Map/index.tsx(666,15): Property 'default' does not exist
src/components/Map/index.test.tsx(6,8): Module 'maplibre-gl' has no default export
```

That is the entire typecheck regression (5 baseline → 8) and the one extra Prettier offender.
**None of it is A/V work.** The merge also brings the `.gitignore` entry for the generated worker.

---

## 2. What was added

New modules under `src/components/Viewer/Player/`:

| File                                              | Role                                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Player.tsx`                                      | Thin switch on `options.player.controls`                                                     |
| `NativePlayer.tsx`                                | The previous `<video controls>`, lifted verbatim                                             |
| `usePlayerBindings.ts`                            | Shared element-bound effects (activePlayer dispatch, poster, timeupdate, content-state seek) |
| `Custom/CustomPlayer.tsx`                         | Lazy boundary around the Vidstack subtree                                                    |
| `Custom/PlayerMedia.tsx`                          | `MediaPlayer` / `MediaProvider`, tracks, chapters, poster, gestures                          |
| `Custom/PlayerControls.tsx` + `.css`              | The transport bar, menus, scrubber                                                           |
| `Custom/CaptionSync.tsx`                          | Applies the shared caption selection to the player                                           |
| `Custom/Waveform.tsx`, `useProgressivePeaks.ts`   | wavesurfer.js timeline for Sound canvases                                                    |
| `Custom/Icons.tsx`                                | Control glyphs                                                                               |
| `src/hooks/use-iiif/getPlayerResources.ts` + test | The IIIF → player model (captions, chapters, sources, poster, duration)                      |

`getPlayerResources` is the part worth reviewing first: it is pure, fully unit-tested, and holds
all the Manifest interpretation. Everything Vidstack-specific binds to its output.

### Dependencies

|                   | Version   | Notes                                                                                                                                                                                                                                                    |
| ----------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vidstack/react` | `1.15.6`  | Published under the **`next`** dist-tag; `latest` is 0.6.15 (April 2024). Audit tooling will read as stale. ESM-only — bundled, not externalised, so CJS consumers are unaffected. Verified: no `require("@vidstack/react")` in `dist/viewer/index.cjs`. |
| `wavesurfer.js`   | `7.12.12` | BSD-3, zero dependencies, dual ESM/CJS                                                                                                                                                                                                                   |

Neither carries a deprecation notice; `npm install --dry-run` reports none.

### Bundle cost

Measured gzip, built from `origin/main` in a throwaway worktree for the baseline:

|                                    | before | after       |
| ---------------------------------- | ------ | ----------- |
| `dist/viewer/index.mjs`            | 671 KB | **808 KB**  |
| `dist/web-components/index.umd.js` | 927 KB | **1040 KB** |

Both deps sit behind a lazy boundary, so an image-only Manifest never evaluates them — but the
library builds to a single entry per package (`inlineDynamicImports`), so the **bytes ship either
way**. `player.controls: "native"` is a choice about the interface, not a way to ship less code.
This is the main open judgement call for a reviewer.

---

## 3. Behaviour changes a consumer will notice

`options.player.controls` defaults to **`"custom"`**. Four things leave the default path; all
remain available under `"native"`:

| Gone from the default path                       | Replacement                                         |
| ------------------------------------------------ | --------------------------------------------------- |
| `<video id="clover-iiif-video">`                 | `.clover-viewer-player` / `[data-media-player]`     |
| `<source>` children, one per `Choice` body       | A single resolved source + quality menu             |
| Frequency-bar `AudioVisualizer` on Sound         | wavesurfer waveform, which is also the seek control |
| `--clover-color-primary-alt` as media background | Fixed black; style `.clover-viewer-player-wrapper`  |

`activePlayer` still publishes the underlying media element on both paths, so transcript-cue
seeking is unchanged.

Also removed: **the position number beside each row in the table of contents**. It was the
target canvas's index in the viewer's own sequence, not a Manifest value, so on Ranges spanning
several canvases it read as an arbitrary sequence (1, 3, 3, 5) next to labels carrying their own
numbering. Nothing in the panel now renders a value the Manifest did not supply.

---

## 4. Defects found by measurement, and fixed

These were found by instrumenting the running app, not by reading code. Each is worth a look
because the symptom and the cause were far apart.

### 4.1 Caption language switching never settled

**Symptom** — toggling between two caption languages left the picker naming one language and the
transcript showing the other, permanently.

**Measured** — `en, it, en, it …` at ~5ms intervals: **2,567 WebVTT fetches in 8.8 seconds**.

**Cause** — `CaptionSync` ran two effects that mirrored each other (store ← player, store →
player). Vidstack's `useActiveTextTrack` and the `mode` flags on the track list disagree _during_
a switch, so each effect read a different answer and corrected the other.

**Fix** — both caption menus belong to Clover, so each now publishes `activeCaptionSrc` directly
when the reader picks something, and a single effect applies the store to the player. One
direction of travel. `useActiveTextTrack` is gone from the component.

**After** — three toggles produce **4 fetches**; picker and transcript agree.

A second, independent fault was fixed alongside: the switch turned the chosen track on without
turning the previous one off, leaving two caption tracks `showing`.

### 4.2 Scrubber chapter markers overlapped and flickered

- `TimeSlider.Chapters` hands the render prop the whole cue list once and expects **one element
  per cue**. We returned a single wrapper containing a `map` of tracks, so Vidstack sized that
  wrapper to the full duration: segments divided the bar evenly instead of by length, and all
  shared one fill, so they advanced together.
- Separately, the chapters `<Track>` got a fresh `{ cues }` literal on every render. Vidstack
  compares that prop by identity and rebuilds the track; a rebuilt track is briefly empty, which
  the scrubber draws as one full-width segment. Hovering re-rendered often enough to read as a
  flicker, **and** left the active-chapter state with nothing stable to track, which is why the
  chapter title never left the first chapter.

Verified on Cookbook 0026: segments measure 34 / 413 / 372 px against an expected 34 / 415 / 374,
including the open-ended final `#t=`. Five hover passes now produce one stable layout where they
previously alternated between two.

### 4.3 Choosing a chapter did nothing

`Contents/Page.tsx` only ever changed canvas, and returned early when the canvas was already
showing — so on a Manifest whose chapters are time fragments of one canvas (what A/V `structures`
usually are) **every chapter was inert**. Chapters now seek.

Cross-canvas seeking needed two attempts. Vidstack **reuses the same `<video>` element** when the
new source needs the same provider (confirmed by tagging the node: `sameElement: true`), so
element identity is not a usable signal. The pending seek is keyed on `currentSrc` instead and
applied once the element is playing a different source _and_ has metadata.

### 4.4 The transcript scrolled out from under the dropdown

The panel re-centres on the active cue 1.5s after the reader stops scrolling. Reaching for the
language control meant having scrolled a moment ago, so the list slid away mid-reach and the
click landed on whatever moved into its place — the menu appeared not to open. Confirmed by
sampling at frame rate through a click: `everOpened: false`.

Opening the list now holds the panel still. It needs **both** `isUserScrolling` (stops a cue
scrolling the panel) and `isAutoScrolling` (stops the panel's scroll handler re-arming the
expiry); setting only the first was not enough.

### 4.5 Dropdowns inverted against the page theme

`Select.css` carried `.dark` overrides pointing the surface at `--clover-color-primary` and text
at `-secondary`. A dark-themed page already maps dark values onto those properties, so the
overrides swapped a correctly dark dropdown back to light. They were also the only `.dark` rules
in the library — every other component takes dark mode from the tokens alone. Removed.

Measured after: light page 15.98:1, dark page 16.25:1, surface matching the page both ways.

### 4.6 Smaller fixes

- A `Choice` of caption tracks published `data-format="text/plain"`, so the transcript kept the
  2rem thumbnail well and 1rem gap meant for a text annotation — a 48px indent. The row now
  publishes the format it actually renders.
- The active cue was marked up correctly but styled only with a 13% grey wash — 1.11:1 against
  the panel in either theme. It now carries an accent marker.
- The table of contents marked _every_ Range targeting the active canvas, lighting a whole act
  at once. It now marks the deepest Range whose `#t=` span holds the playhead, with the
  containing chapter carrying the highlight and only the current line in bold.
- A dropdown open locked body scroll and handed the width back as a right _margin_, which a body
  sized to the viewport ignores — the page slid sideways by half a scrollbar. Restored as padding.
- The dropdown had no stacking order, so transcript cues and the control bar painted over it.
- The captions button appeared on Manifests with no captions, offering only "Off".
- `playerCaptionsOff` existed in all eight locales but was never passed to Vidstack, so that row
  stayed English. (Proved by temporarily changing the key and watching the menu follow.)
- `Select` never forwarded `onOpenChange` despite its props extending Radix's.

---

## 5. How it was verified

Driven in a real browser against:

| Manifest                                                                              | What it exercises                                                |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Cookbook [0219](https://iiif.io/api/cookbook/recipe/0219-using-caption-file/)         | Video with a supplementing WebVTT file                           |
| Cookbook [0074](https://iiif.io/api/cookbook/recipe/0074-multiple-language-captions/) | One caption file per language inside a `Choice`                  |
| Cookbook [0026](https://iiif.io/api/cookbook/recipe/0026-toc-opera/)                  | A/V table of contents, single canvas, open-ended `#t=`           |
| Cookbook [0065](https://iiif.io/api/cookbook/recipe/0065-opera-multiple-canvases/)    | The same work across two canvases — cross-canvas chapter seeking |
| Cookbook [0024](https://iiif.io/api/cookbook/recipe/0024-book-4-toc/)                 | Nested ranges on an image Manifest, no time fragments            |
| Cookbook [0002](https://iiif.io/api/cookbook/recipe/0002-mvm-audio/)                  | Sound canvas and the waveform                                    |
| NU `684e4649…`                                                                        | HLS video plus four image canvases — player/OSD toggling         |

Checks that are easy to lose and worth re-running after any change:

- **No jsDelivr request.** Vidstack's HLS provider defaults to a CDN; `hls.js` is injected
  locally in `onProviderChange`. Confirmed zero matching requests.
- **Canvas toggling leaks nothing.** Six switches on the mixed NU Manifest: media elements
  `0↔1`, OSD canvases `0↔2`, no accumulation, zero console errors.
- **Preact parity.** `playwright/e2e/wc.spec.ts` drives the real UMD bundle, which is built with
  `react` aliased to `preact/compat`. The fixture is local VP9 on purpose — Playwright's Chromium
  has no proprietary codecs, so an H.264 fixture never reaches `canplay` and reads exactly like a
  compat failure.

---

## 6. Left to do

Ordered by what blocks a merge.

1. **Merge `origin/main`** — see §1. Resolves the 3 typecheck errors and the untracked generated
   worker. _Blocked on a human; agents may not commit._

2. **Decide on the bundle cost** — §2. ~137 KB gzip on `/viewer` for a feature that cannot be
   tree-shaken out. Externalising is the lever, at the cost of CJS consumers on Node.

3. **`Cue.tsx` leaks `timeupdate` listeners.** It adds one per render, and the cleanup calls
   `document.removeEventListener("timeupdate", () => {})` — wrong target _and_ a fresh function
   reference, so it removes nothing. Pre-existing, but now on the default path.
   `Contents/Page.tsx`'s `useCurrentTime` shows the correct shape.

4. **`data-content="None"` on every VTT annotation row.** `value || chars || "None"`, and a VTT
   body has neither. Pre-existing, also on `main`. Harmless but meaningless.

5. **A PointSelector annotation renders a cue whose text is literally "None"** — same cause as 4,
   but visible to a reader. Reproduces on `public/manifest/content-state/point-selector.json`.

Deliberately out of scope, carried from the original plan:

6. Unify VTT parsing on Vidstack's `useTextCues`, dropping `node-webvtt` (two parsers ship today).
7. Consolidate the four near-identical pill buttons (a third was already documented as deliberate
   duplication in `Map/Controls.css`).
8. Scrubber thumbnails from the IIIF Image API.

---

## 7. Gate

```
npx vitest run     457 passed | 1 skipped (89 files)
npx tsc --noEmit   8 errors   — 5 baseline + 3 maplibre (see §1)
npx prettier       24 offenders — all baseline, none in this branch's changed set
npx next lint      3 errors   — all baseline, in files this branch does not touch
npm run build      clean
```

`npm run lint` exits 1 on `main` as well; the three ESLint errors live in
`src/lib/annotation-helpers.test.ts` and `src/lib/utils.test.ts` and predate this work.

---

## 8. Notes for the reviewer

- **Where the IIIF logic lives.** `getPlayerResources.ts` is the file to review for correctness
  of Manifest interpretation. The Vidstack binding is replaceable; that module is the contract.
- **Two palettes in the player, on purpose.** Buttons follow the theme tokens, because a pill is
  opaque and carries its own foreground with its own background. Anything sitting bare on the
  scrim — time, chapter title, slider track, menu, cue box — stays anchored, because its only
  ground is the scrim, which is dark in every theme; pointing it at `-primary` would put
  near-black on near-black in a light theme.
- **One shared active treatment.** The transcript cue and the contents chapter are the same thing
  to a reader — a list of places to jump to — and are styled identically. The two rules live in
  separate files because of the colocated-CSS contract and cross-reference each other; keep them
  in step.
- **`custom-properties.test.ts`** guards the rule that exactly one custom property is _declared_
  library-wide. If a `var(--clover-*)` loses its literal fallback, or a colour fallback drifts
  from `tokens.ts`, it fails.
