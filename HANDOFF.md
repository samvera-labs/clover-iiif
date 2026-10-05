# Custom A/V player — handoff for review

Branch `custom-av-player` · PR [samvera-labs/clover-iiif#367](https://github.com/samvera-labs/clover-iiif/pull/367)

Replaces the Viewer's bare `<video controls>` with a Clover-styled transport bar built on
[Vidstack](https://vidstack.io/docs), driven by the Manifest. Written against the plan in the PR
description; this document covers what landed, how it was verified, and what is still open.

---

## 1. State of the branch

The human completed the rebase onto `origin/main` at `5586d99c` (3.16.2).
The branch is three commits ahead and none behind that base:

- `62bb215a` — Introduce custom A/V component.
- `8c3e4d4b` — Refine.
- `5c376653` — Continue refinements.

The MapLibre 6 updates are present and typechecking now passes. The original
uncommitted work described by this handoff is included in the third commit.

The working tree now contains an unstaged follow-up: transcript listener cleanup,
removal of the "None" fallback, PointSelector support at zero seconds, HLS audio
canvas bars, deferred player chunks, regression tests, and documentation updates. No agent staging or
commits were performed.

---

## 2. What was added

New modules under `src/components/Viewer/Player/`:

| File                                                            | Role                                                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Player.tsx`                                                    | Thin switch on `options.player.controls`                                                      |
| `NativePlayer.tsx`                                              | The previous `<video controls>`, lifted verbatim                                              |
| `usePlayerBindings.ts`                                          | Shared element-bound effects (activePlayer dispatch, poster, timeupdate, content-state seek)  |
| `Custom/CustomPlayer.tsx`                                       | Lazy boundary around the Vidstack subtree                                                     |
| `Custom/PlayerMedia.tsx`                                        | `MediaPlayer` / `MediaProvider`, tracks, chapters, poster, gestures                           |
| `Custom/PlayerControls.tsx` + `.css`                            | The transport bar, menus, scrubber                                                            |
| `Custom/CaptionSync.tsx`                                        | Applies the shared caption selection to the player                                            |
| `Custom/Waveform.tsx`, `useProgressivePeaks.ts`                 | wavesurfer.js timeline for non-HLS Sound files, with progressive peaks above the decoding cap |
| `Custom/HlsAudioBars.tsx`, `audioSource.ts`, `waveformStyle.ts` | HLS live frequency bars, shared Web Audio source, and shared bar styling                      |
| `Custom/Icons.tsx`                                              | Control glyphs                                                                                |
| `src/hooks/use-iiif/getPlayerResources.ts` + test               | The IIIF → player model (captions, chapters, sources, poster, duration)                       |

`getPlayerResources` is the part worth reviewing first: it is pure, fully unit-tested, and holds
all the Manifest interpretation. Everything Vidstack-specific binds to its output.

### Dependencies

|                   | Version   | Notes                                                                                                                                                                                                                                                    |
| ----------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vidstack/react` | `1.15.6`  | Published under the **`next`** dist-tag; `latest` is 0.6.15 (April 2024). Audit tooling will read as stale. ESM-only — bundled, not externalised, so CJS consumers are unaffected. Verified: no `require("@vidstack/react")` in `dist/viewer/index.cjs`. |
| `wavesurfer.js`   | `7.12.12` | BSD-3, zero dependencies, dual ESM/CJS                                                                                                                                                                                                                   |

Neither carries a deprecation notice; `npm install --dry-run` reports none.

### Packaging and bundle cost

The builds preserve dynamic imports instead of flattening them with
`inlineDynamicImports`. Vidstack stays bundled (including for CommonJS compatibility),
but its player chunk loads only when a custom A/V player mounts. WaveSurfer is a
separate chunk requested only for non-HLS Sound within the decoding limit. Image-only
viewers and native controls load neither. Other existing dynamic imports, including
MapLibre and marked, also retain their loading boundaries.

The web-component entry is now ESM with Preact shared across the chunks.
`dist/web-components/index.umd.js` remains as a classic-script bootstrap, resolving
`index.mjs` beside itself. Self-hosters must copy the whole directory, serve `.mjs`
as JavaScript, and allow CORS for cross-origin hosting. Registration is asynchronous;
use `customElements.whenDefined()` before immediately calling an element's API.
The HTML CI fixtures copy all chunks and wait for registration.

Measured with Node gzip, decimal kB, summing the entry and its static imports:

| Build              | Initial JS and embedded CSS | Deferred player chunk | Separate WaveSurfer chunk |
| ------------------ | --------------------------: | --------------------: | ------------------------: |
| Viewer ESM         |                   299.05 kB |              96.86 kB |                  13.66 kB |
| Viewer CommonJS    |                   277.32 kB |              81.91 kB |                  12.31 kB |
| Web components ESM |                   563.02 kB |              96.87 kB |                  13.65 kB |

The web-component bootstrap adds less than 0.4 kB gzip. Player figures exclude
Vidstack's additional on-demand provider/caption chunks and hls.js. ESM/CommonJS
figures exclude external dependencies; the consumer bundler controls final delivery.
These are loading-stage sizes, not a PR-versus-main comparison. Before this packaging
change, the branch shipped 1,097.41 kB gzip in the Viewer ESM entry and 1,330.48 kB
in the web-component UMD entry. The reduction also reflects deferred map/Markdown code,
not just A/V. Downloading all optional chunks still carries their total package cost.

`npm run test:build` checks the real emitted ESM, CommonJS, and web-component graphs:
neither dependency is statically reachable from the entry, Vidstack is reachable from
the deferred player, and WaveSurfer remains behind another dynamic boundary.

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
- **Preact parity.** `playwright/e2e/wc.spec.ts` drives the built web-component chunks through the classic script loader, with
  `react` aliased to `preact/compat`. The fixture is local VP9 on purpose — Playwright's Chromium
  has no proprietary codecs, so an H.264 fixture never reaches `canplay` and reads exactly like a
  compat failure.

---

## 6. Left to do

Nothing outstanding for the A/V work. The three deliberately out-of-scope items from the
original plan are listed at the end of this section.

Completed in this follow-up:

- The repository's pre-existing lint failures are cleared, so `npm run lint` exits 0 for the
  first time on this branch. 23 files were Prettier-formatted (no semantic change; the three
  JSON manifests and four JSON configs were parsed before and after and compared equal). Three
  ESLint errors were fixed at the source rather than suppressed: an unused `commentingCount` in
  `annotation-helpers.test.ts` was removed — the single-motivation path is already covered by
  the tagging test, which also asserts every result's motivation — and the two anonymous
  `React.memo` / `React.forwardRef` components in `utils.test.ts` were given names, which is
  what `react/display-name` is asking for and what a stack trace needs.

- Vidstack and WaveSurfer are emitted as deferred chunks in all published builds.
  Build regression checks are included in the web-component CI workflow. Browser
  verification of the built web component confirmed native controls request neither,
  video requests the player but no WaveSurfer, and HLS Sound requests the player/HLS
  chunks while using live canvas bars. A short non-HLS Sound file requests the separate
  WaveSurfer chunk and renders a decoded waveform with the correct duration. WaveSurfer
  now waits for the current file's metadata before initializing: the Canvas duration
  hint previously allowed it to read an empty/stale source and disrupt playback.
  A regression test covers the delayed metadata and stale source case.
  The classic script resolves modules correctly
  from an assets directory separate from the embedding page.
- The human rebased onto main; the MapLibre typecheck blocker is gone.
- HLS Sound resources use a live canvas frequency visualizer, with the same centered,
  rounded 4px bars, 2px gaps, and colors as the file waveform. Both URL and MIME-type
  HLS detection bypass the WaveSurfer dynamic import. Videos never render the waveform.
  The shared Web Audio source preserves playback when a media element is reused;
  animation frames, event listeners, and analyser connections are cleaned up.
  Seven new tests cover routing, source switching, indefinite-duration playback,
  pause, resize, remount, and unavailable Web Audio. Browser verification used audio
  from the existing public Mux HLS fixture in a temporary Sound preview; live bars
  rendered without console errors. The temporary preview page was removed afterward.
- Transcript cue rows carry a stable React key. `use-webvtt` mints an identifier for every
  parsed cue, but the cue synthesised for a PointSelector annotation in `Item.tsx` had none,
  so React warned and rebuilt the list on each render instead of updating it. The synthesised
  cue now takes the annotation's id, and `Menu` falls back to the cue's timing rather than
  trusting a field its own type marks optional. Verified: no key warning on a clean load of
  the PointSelector fixture.
- `Cue.tsx` removes each `timeupdate` callback from the same media element that
  received it. Current-cue state is initialized when the player or cue changes.
  Tests cover canvas changes, cue replacement, and StrictMode unmount cleanup.
- Empty annotation bodies no longer invent "None" or publish `data-content="None"`.
  Bodyless PointSelectors keep a timestamp-only cue; `t: 0` is accepted too.
- In the rebased preview, caption selection was verified in both directions
  between player and transcript, captions Off preserved all 22 transcript cues,
  and keyboard cue activation sought and started playback. The PointSelector
  fixture visibly renders `38:38` with no placeholder text.

Deliberately out of scope, carried from the original plan:

6. Unify VTT parsing on Vidstack's `useTextCues`, dropping `node-webvtt` (two parsers ship today).
7. Consolidate the four near-identical pill buttons (a third was already documented as deliberate
   duplication in `Map/Controls.css`).
8. Scrubber thumbnails from the IIIF Image API.

---

## 7. Gate

```
npx vitest run      471 passed | 1 skipped (91 files)
npm run test:build  passed (2 build tests, 3 output formats)
npm run typecheck   0 errors
npm run lint        exit 0 — 0 Prettier offenders, 0 ESLint errors
npm run build       passed
```

`npm run lint` previously exited 1 on this branch _and_ on `main`; §6 covers the cleanup.

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
