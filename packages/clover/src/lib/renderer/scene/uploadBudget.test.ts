import type { LoadedImage } from "../io/decode";
import { uploadBudget } from "./uploadBudget";

const tile = (
  width = 512,
  height = 512,
  kind: LoadedImage["kind"] = "bitmap",
  opaque = false,
): LoadedImage =>
  ({
    kind,
    source: {},
    width,
    height,
    naturalWidth: width,
    naturalHeight: height,
    opaque,
  }) as LoadedImage;

// A 512 px tile is 1 MiB decoded; the budget below takes two.
const TWO_TILES = 2 * 512 * 512 * 4;

describe("uploadBudget", () => {
  it("takes new tiles up to the budget, then holds the rest back", () => {
    const cache = (url: string) => (url.startsWith("t") ? tile() : undefined);
    const budget = uploadBudget(cache, () => false, TWO_TILES);
    expect(budget.getTile("t1")).toBeDefined();
    expect(budget.getTile("t2")).toBeDefined();
    expect(budget.deferred).toBe(false);
    expect(budget.getTile("t3")).toBeUndefined();
    expect(budget.deferred).toBe(true);
    // Asked again, an admitted tile is still there and costs nothing more.
    expect(budget.getTile("t1")).toBeDefined();
    expect(budget.getTile("missing")).toBeUndefined();
  });

  it("never holds back what the backend already has", () => {
    const budget = uploadBudget(
      () => tile(),
      () => true,
      0,
    );
    for (let i = 0; i < 10; i++) expect(budget.getTile(`t${i}`)).toBeDefined();
    expect(budget.deferred).toBe(false);
  });

  it("always takes one, so an image larger than the budget still shows", () => {
    const budget = uploadBudget(
      () => tile(8000, 6000),
      () => false,
      TWO_TILES,
    );
    expect(budget.getTile("big")).toBeDefined();
    expect(budget.getTile("big2")).toBeUndefined();
  });

  it("never holds back video, nor pixels shown as a DOM layer", () => {
    const budget = uploadBudget(
      (url) =>
        url === "video"
          ? tile(1920, 1080, "media")
          : tile(512, 512, "element", true),
      () => false,
      0,
    );
    budget.getTile("first");
    expect(budget.getTile("video")).toBeDefined();
    expect(budget.getTile("dom")).toBeDefined();
    expect(budget.deferred).toBe(false);
  });
});
