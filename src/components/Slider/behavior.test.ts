import { describe, expect, it } from "vitest";

import {
  type SliderBehavior,
  groupItemsByBehavior,
  resolveBehavior,
} from "src/components/Slider/behavior";

describe("resolveBehavior", () => {
  it("defaults to individuals when nothing is declared", () => {
    expect(resolveBehavior(undefined)).toBe("individuals");
    expect(resolveBehavior([])).toBe("individuals");
    expect(resolveBehavior(null)).toBe("individuals");
  });

  it("reads the resource's declared layout behavior", () => {
    expect(resolveBehavior(["paged"])).toBe("paged");
    expect(resolveBehavior(["continuous"])).toBe("continuous");
    expect(resolveBehavior(["unordered"])).toBe("unordered");
  });

  it("tolerates a bare string", () => {
    expect(resolveBehavior("paged")).toBe("paged");
  });

  it("ignores behaviors from other disjoint sets", () => {
    // auto-advance is temporal, together is a collection behavior; neither says
    // anything about layout.
    expect(resolveBehavior(["auto-advance", "together", "paged"])).toBe(
      "paged",
    );
    expect(resolveBehavior(["auto-advance", "no-repeat"])).toBe("individuals");
  });

  it("lets an explicit override win over the resource", () => {
    expect(resolveBehavior(["paged"], "individuals")).toBe("individuals");
    expect(resolveBehavior(undefined, "paged")).toBe("paged");
  });
});

describe("groupItemsByBehavior", () => {
  const items = ["a", "b", "c", "d", "e"];

  it("gives every item its own slide for individuals", () => {
    expect(groupItemsByBehavior(items, "individuals")).toEqual([
      ["a"],
      ["b"],
      ["c"],
      ["d"],
      ["e"],
    ]);
  });

  it("treats unordered and continuous as one item per slide", () => {
    (["unordered", "continuous"] as SliderBehavior[]).forEach((behavior) =>
      expect(groupItemsByBehavior(items, behavior)).toHaveLength(items.length),
    );
  });

  it("opens on a cover then pairs for paged", () => {
    expect(groupItemsByBehavior(items, "paged")).toEqual([
      ["a"],
      ["b", "c"],
      ["d", "e"],
    ]);
  });

  it("leaves a trailing odd page alone when paged", () => {
    expect(groupItemsByBehavior(["a", "b", "c", "d"], "paged")).toEqual([
      ["a"],
      ["b", "c"],
      ["d"],
    ]);
  });

  it("handles an empty list and a single item", () => {
    expect(groupItemsByBehavior([], "paged")).toEqual([]);
    expect(groupItemsByBehavior(["a"], "paged")).toEqual([["a"]]);
  });
});
