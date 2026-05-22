import {
  AnnotationCollectionNormalized,
  AnnotationPageRaw,
  AnnotationRaw,
  AnnotationTargetRaw,
} from "src/types/annotation-collection";
import { InternationalString } from "@iiif/presentation-3";

async function fetchPage(url: string): Promise<AnnotationPageRaw | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json, application/ld+json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Follows the `next` chain starting from an already-fetched AnnotationPage,
 * returning all pages as an array.
 */
async function collectPages(firstPage: AnnotationPageRaw): Promise<AnnotationPageRaw[]> {
  const pages: AnnotationPageRaw[] = [firstPage];
  let nextUrl = firstPage.next;
  while (nextUrl) {
    const page = await fetchPage(nextUrl);
    if (!page) break;
    pages.push(page);
    nextUrl = page.next;
  }
  return pages;
}

/**
 * Given a pre-fetched AnnotationCollection JSON object, loads all linked
 * AnnotationPages by following the `first`/`next` chain.
 */
export async function loadAnnotationCollection(
  collectionJson: Record<string, any>,
): Promise<AnnotationCollectionNormalized> {
  const pages: AnnotationPageRaw[] = [];

  let nextUrl: string | undefined =
    typeof collectionJson.first === "string"
      ? collectionJson.first
      : collectionJson.first?.id;

  while (nextUrl) {
    const page = await fetchPage(nextUrl);
    if (!page) break;
    pages.push(page);
    nextUrl = page.next;
  }

  return {
    id: collectionJson.id,
    type: "AnnotationCollection",
    label: collectionJson.label as InternationalString | undefined,
    total: collectionJson.total,
    pages,
  };
}

/**
 * Given a pre-fetched AnnotationPage JSON object, wraps it (and any linked
 * pages via `next`) into a synthetic AnnotationCollectionNormalized so it
 * can be handled by the same rendering path as AnnotationCollection.
 */
export async function loadAnnotationPage(
  pageJson: Record<string, any>,
): Promise<AnnotationCollectionNormalized> {
  const pages = await collectPages(pageJson as AnnotationPageRaw);
  return {
    id: pageJson.id,
    type: "AnnotationCollection",
    label: pageJson.label as InternationalString | undefined,
    pages,
  };
}

/**
 * Extracts manifest and canvas IDs from an annotation target, handling
 * string targets, SpecificResource, and direct Canvas references.
 */
export function getManifestFromAnnotationTarget(target: AnnotationTargetRaw): {
  manifest?: string;
  canvas?: string;
} {
  if (!target) return {};

  if (typeof target === "string") {
    const [canvasId] = target.split("#");
    return { canvas: canvasId };
  }

  if (target.type === "SpecificResource" && target.source) {
    const source = target.source;
    if (typeof source === "string") {
      return { canvas: source };
    }
    return {
      manifest: source.partOf?.[0]?.id,
      canvas: source.id,
    };
  }

  if (target.id) {
    const [canvasId] = target.id.split("#");
    return {
      manifest: (target as any).partOf?.[0]?.id,
      canvas: canvasId,
    };
  }

  return {};
}

/**
 * Returns the manifest ID of the first annotation in the collection that
 * carries `partOf` context, enabling auto-loading the manifest.
 */
export function getFirstManifestFromAnnotationCollection(
  collection: AnnotationCollectionNormalized,
): string | undefined {
  for (const page of collection.pages) {
    for (const annotation of page.items ?? []) {
      const { manifest } = getManifestFromAnnotationTarget(annotation.target);
      if (manifest) return manifest;
    }
  }
  return undefined;
}

/**
 * Returns the canvas ID and selector of the first annotation in the
 * collection that has a target, for use as the initial zoom target.
 */
export function getFirstAnnotationTarget(
  collection: AnnotationCollectionNormalized,
): { canvasId: string | undefined; annotationId: string | undefined } {
  for (const page of collection.pages) {
    for (const annotation of page.items ?? []) {
      const { canvas: canvasId } = getManifestFromAnnotationTarget(
        annotation.target,
      );
      if (canvasId) {
        return { canvasId, annotationId: annotation.id };
      }
    }
  }
  return { canvasId: undefined, annotationId: undefined };
}

/**
 * Returns the plain-text label for an annotation, preferring the first
 * text body value, then falling back to the annotation id.
 */
export function getAnnotationBodyText(annotation: AnnotationRaw): string {
  const bodies = Array.isArray(annotation.body)
    ? annotation.body
    : annotation.body
      ? [annotation.body]
      : [];

  const textBody = bodies.find((b) => b.value);
  return textBody?.value || annotation.id;
}
