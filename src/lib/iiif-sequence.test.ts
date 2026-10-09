import book from "src/fixtures/iiif-cookbook/0009-book-1.json";
import continuous from "src/fixtures/iiif-cookbook/0011-book-3-behavior-continuous.json";
import individuals from "src/fixtures/iiif-cookbook/0011-book-3-behavior-individuals.json";
import foldouts from "src/fixtures/iiif-cookbook/0035-foldouts.json";
import { groupViews, resolveBehavior, viewOf } from "src/lib/iiif-sequence";

const items = (manifest: { items: unknown[] }) =>
  manifest.items as Array<{ id: string; behavior?: string[] }>;

describe("resolveBehavior", () => {
  it("takes the first layout value, ignoring other sets, defaulting to individuals", () => {
    expect(resolveBehavior(["auto-advance", "paged"])).toBe("paged");
    expect(resolveBehavior("continuous")).toBe("continuous");
    expect(resolveBehavior(["hidden"])).toBe("individuals");
    expect(resolveBehavior(undefined)).toBe("individuals");
  });
});

describe("groupViews", () => {
  it("shows individuals one at a time (0011)", () => {
    expect(groupViews(items(individuals), "individuals")).toEqual([
      [0],
      [1],
      [2],
      [3],
    ]);
  });

  it("pairs a paged book into spreads after its cover (0009)", () => {
    expect(groupViews(items(book), "paged")).toEqual([[0], [1, 2], [3, 4]]);
  });

  it("keeps a non-paged foldout on its own, and re-pairs after it (0035)", () => {
    // Canvas 3 is the unfolded foldout: `non-paged`.
    expect(groupViews(items(foldouts), "paged")).toEqual([
      [0],
      [1, 2],
      [3],
      [4, 5],
      [6, 7],
      [8],
    ]);
  });

  it("shows a facing-pages Canvas alone, then pairs again a page later", () => {
    // Six pages, the third already a spread. As in @iiif/helpers: the page left waiting
    // before it stands alone, so does the page after it, and pairing then resumes.
    const pages = [...items(book), { ...items(book)[4], id: "extra" }];
    const canvases = pages.map((canvas, i) =>
      i === 2 ? { ...canvas, behavior: ["facing-pages"] } : canvas,
    );
    expect(groupViews(canvases, "paged")).toEqual([[0], [1], [2], [3], [4, 5]]);
  });

  it("joins a continuous object into a single view (0011)", () => {
    expect(groupViews(items(continuous), "continuous")).toEqual([[0, 1, 2, 3]]);
  });

  it("finds the view holding a Canvas", () => {
    const views = groupViews(items(book), "paged");
    expect(viewOf(views, 4)).toBe(2);
  });
});
