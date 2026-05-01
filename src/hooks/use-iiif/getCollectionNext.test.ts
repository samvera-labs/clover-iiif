import { describe, expect, it } from "vitest";

import { CollectionNormalized } from "@iiif/presentation-3";
import { getCollectionNext } from "src/hooks/use-iiif";

const buildCollection = (
  id: string,
  items: Array<{ id: string; type: "Manifest" | "Collection" }>,
): CollectionNormalized =>
  ({
    id,
    type: "Collection",
    items,
  }) as unknown as CollectionNormalized;

describe("getCollectionNext", () => {
  it("returns undefined for a Collection with no items", () => {
    const collection = buildCollection("https://example.org/c", []);
    expect(getCollectionNext(collection)).toBeUndefined();
  });

  it("returns undefined when all items are Manifests", () => {
    const collection = buildCollection("https://example.org/c", [
      { id: "https://example.org/m/1", type: "Manifest" },
      { id: "https://example.org/m/2", type: "Manifest" },
    ]);
    expect(getCollectionNext(collection)).toBeUndefined();
  });

  it("returns the trailing Collection id as the next page", () => {
    const collection = buildCollection("https://example.org/c?page=1", [
      { id: "https://example.org/m/1", type: "Manifest" },
      { id: "https://example.org/m/2", type: "Manifest" },
      { id: "https://example.org/c?page=2", type: "Collection" },
    ]);
    expect(getCollectionNext(collection)).toBe("https://example.org/c?page=2");
  });

  it("ignores a Collection item that is not the last entry", () => {
    const collection = buildCollection("https://example.org/c", [
      { id: "https://example.org/sub", type: "Collection" },
      { id: "https://example.org/m/1", type: "Manifest" },
    ]);
    expect(getCollectionNext(collection)).toBeUndefined();
  });

  it("guards against a self-referencing next pointer", () => {
    const collection = buildCollection("https://example.org/c", [
      { id: "https://example.org/m/1", type: "Manifest" },
      { id: "https://example.org/c", type: "Collection" },
    ]);
    expect(getCollectionNext(collection)).toBeUndefined();
  });
});
