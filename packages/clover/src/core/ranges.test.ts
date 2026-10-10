import bookJson from "../fixtures/iiif-cookbook/0024-book-4-toc.json";
import operaJson from "../fixtures/iiif-cookbook/0026-toc-opera.json";
import { p4 } from "../fixtures/presentation4";
import { currentContents, tableOfContents } from "./ranges";

describe("tableOfContents", () => {
  it("unwraps a single top Range and nests the rest", () => {
    const toc = tableOfContents(p4(bookJson));
    expect(toc.map((node) => node.label)).toEqual(
      bookJson.structures[0].items.map((range: any) => range.label),
    );
    const second = toc[1];
    expect(second.children.length).toBeGreaterThan(0);
    // A Range made only of Ranges starts where its first child starts.
    expect(second.canvasId).toBe(second.children[0].canvasId);
  });

  it("marks the deepest entry covering the Canvas, not only its first", () => {
    const toc = tableOfContents(p4(bookJson));
    const [first] = toc;
    expect(currentContents(toc, first.canvasIds[1])).toBe(first.id);
    const monday = toc[1].children[0];
    expect(currentContents(toc, monday.canvasIds[0])).toBe(monday.id);
  });

  it("follows time through an opera's acts", () => {
    const toc = tableOfContents(p4(operaJson));
    const canvas = operaJson.items[0].id;
    const acts = toc[0].children.length ? toc[0].children : toc;
    expect(acts[0].time?.start).toBe(0);
    expect(currentContents(toc, canvas, 10)).toBe(
      currentContents(toc, canvas, 20),
    );
    expect(currentContents(toc, canvas, 4000)).not.toBe(
      currentContents(toc, canvas, 10),
    );
  });

  it("is empty without structures", () => {
    expect(tableOfContents(p4({ ...bookJson, structures: undefined }))).toEqual(
      [],
    );
  });
});
