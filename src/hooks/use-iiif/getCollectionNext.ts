import { CollectionNormalized, Reference } from "@iiif/presentation-3";

/**
 * Detect a next-page URL on a Collection following the convention discussed
 * in IIIF/api#2174 ("Last Item Entry is Next Page"): a Collection used as a
 * paged response includes a trailing `items` entry of `type: "Collection"`
 * whose `id` resolves to the next page of the same response.
 *
 * Returns the next-page URL or undefined if the Collection is not paged.
 */
export const getCollectionNext = (
  collection: CollectionNormalized | undefined,
): string | undefined => {
  if (!collection?.items?.length) return undefined;

  const last = collection.items[collection.items.length - 1] as Reference<
    "Collection" | "Manifest"
  >;
  if (last?.type !== "Collection") return undefined;

  // guard against a Collection that lists itself as its only "next" pointer
  if (last.id === collection.id) return undefined;

  return last.id;
};
