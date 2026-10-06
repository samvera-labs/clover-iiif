import { renderHook } from "@testing-library/react";
import { Vault } from "@iiif/helpers/vault";
import manifest from "src/fixtures/iiif-cookbook/0013-placeholderCanvas.json";
import { usePlayerPoster } from "./usePlayerPoster";

const state = vi.hoisted(() => ({ activeCanvas: "", vault: null as any }));
vi.mock("src/context/viewer-context", () => ({ useViewerState: () => state }));

const canvas = manifest.items[0];
const poster = canvas.placeholderCanvas.items[0].items[0].body.id;

beforeEach(async () => {
  state.vault = new Vault();
  await state.vault.loadManifest(manifest.id, structuredClone(manifest));
  state.activeCanvas = canvas.id;
});

it("resolves the cookbook placeholder on the first render, without a media element", () => {
  const { result } = renderHook(() => usePlayerPoster());
  expect(result.current).toBe(poster);
});

it("clears the previous poster when moving to a canvas without a preview", async () => {
  const next = {
    ...canvas,
    id: `${canvas.id}/no-preview`,
    placeholderCanvas: undefined,
  };
  await state.vault.loadManifest(
    "https://example.org/next",
    structuredClone({
      ...manifest,
      id: "https://example.org/next",
      items: [next],
    }),
  );
  const { result, rerender } = renderHook(() => usePlayerPoster());
  expect(result.current).toBe(poster);
  state.activeCanvas = next.id;
  rerender();
  expect(result.current).toBeUndefined();
});

it("falls back to an accompanying image and prefers it after playback advances", async () => {
  const accompanying = {
    ...canvas.placeholderCanvas,
    id: "https://example.org/accompanying",
    items: [
      {
        id: "https://example.org/accompanying/page",
        type: "AnnotationPage",
        items: [
          {
            id: "https://example.org/accompanying/annotation",
            type: "Annotation",
            motivation: "painting",
            target: "https://example.org/accompanying",
            body: {
              id: "https://example.org/accompanying.jpg",
              type: "Image",
              format: "image/jpeg",
            },
          },
        ],
      },
    ],
  };
  const withBoth = {
    ...canvas,
    id: "https://example.org/both",
    accompanyingCanvas: accompanying,
  };
  const withAccompanying = {
    ...withBoth,
    id: "https://example.org/only-accompanying",
    placeholderCanvas: undefined,
  };
  await state.vault.loadManifest(
    "https://example.org/previews",
    structuredClone({
      ...manifest,
      id: "https://example.org/previews",
      items: [withBoth, withAccompanying],
    }),
  );
  state.activeCanvas = withBoth.id;
  const { result, rerender } = renderHook(({ time }) => usePlayerPoster(time), {
    initialProps: { time: 0 },
  });
  expect(result.current).toBe(poster);
  rerender({ time: 1 });
  expect(result.current).toBe("https://example.org/accompanying.jpg");
  state.activeCanvas = withAccompanying.id;
  rerender({ time: 0 });
  expect(result.current).toBe("https://example.org/accompanying.jpg");
});
