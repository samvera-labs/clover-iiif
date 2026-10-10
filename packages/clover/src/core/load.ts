import {
  type Target,
  decodeContentState,
  isContentState,
  resolveContentState,
} from "./content-state";
import {
  type Collection,
  type Manifest,
  preloadUpgrader,
  toPresentation4,
} from "./presentation";
import { type CloverRequest, fetchJson } from "./request";

/**
 * Turning whatever a `Root` is handed into a Manifest to show.
 *
 * `iiifContent` may be a URL, a IIIF resource object (Presentation 2, 3 or 4), or a content
 * state (JSON or base64url). The resource may be a Manifest, a Collection (its first
 * Manifest is shown), or a lone Canvas (its `partOf` Manifest, or a Manifest made around
 * it). Everything is fetched once, with the request settings, and upgraded to
 * Presentation 4.
 */

export type IIIFContent = string | Record<string, unknown>;

export interface Loaded {
  manifest: Manifest;
  /** The Collection the Manifest was reached through, when there was one. */
  collection?: Collection;
  /** Where a content state, or a Canvas given directly, points. */
  target?: Target;
}

export class CloverContentError extends Error {
  name = "CloverContentError";
}

const P4_CONTEXT = "http://iiif.io/api/presentation/4/context.json";

const isUrl = (value: string) => /^https?:\/\//i.test(value);

interface LoadOptions {
  request?: CloverRequest;
  signal?: AbortSignal;
}

interface LoadContentOptions extends LoadOptions {
  /** In a Collection, the member Manifest to open instead of the first. */
  manifestId?: string;
}

/** A resource as JSON: fetched if it is only a reference. */
async function dereference(
  resource: Record<string, any>,
  { request, signal }: LoadOptions,
): Promise<Record<string, any>> {
  const embedded = Array.isArray(resource.items) && resource.items.length > 0;
  if (embedded || !resource.id) return resource;
  return (await fetchJson(request, resource.id, signal)) as Record<string, any>;
}

/** Pages of a paged Collection followed, at most: a guard against a `next` loop. */
const MAX_COLLECTION_PAGES = 50;

/**
 * A Collection with its members in `items`. A paged Collection lists none of its own: its
 * members are on CollectionPages, followed from `first` through `next`.
 */
export async function withMembers(
  collection: Collection,
  options: LoadOptions,
): Promise<Collection> {
  const json = collection as unknown as Record<string, any>;
  if (Array.isArray(json.items) && json.items.length) return collection;
  if (!json.first) return collection;
  const items: unknown[] = [];
  let next: unknown = json.first;
  for (let page = 0; next && page < MAX_COLLECTION_PAGES; page++) {
    const reference = typeof next === "string" ? { id: next } : (next as Json);
    const fetched = (
      reference.items
        ? reference
        : await fetchJson(options.request, reference.id, options.signal)
    ) as Json;
    const upgraded = await toPresentation4<Json>({
      "@context": fetched["@context"] ?? json["@context"],
      ...fetched,
      type: "Collection",
    });
    items.push(...((upgraded.items as unknown[]) ?? []));
    next = fetched.next;
  }
  return { ...json, items } as unknown as Collection;
}

/** A Collection member as a Manifest: fetched if only referenced, and upgraded. */
export async function loadManifest(
  member: Json,
  options: LoadOptions = {},
): Promise<Manifest> {
  return toPresentation4<Manifest>(await dereference(member, options));
}

type Json = Record<string, any>;

/** The first Manifest in a Collection, depth first, fetching what is only referenced. */
async function firstManifest(
  collection: Collection,
  options: LoadOptions,
  depth = 0,
): Promise<Manifest | null> {
  for (const item of (collection.items ?? []) as Array<Record<string, any>>) {
    if (item.type === "Manifest") {
      return toPresentation4<Manifest>(await dereference(item, options));
    }
    if (item.type === "Collection" && depth < 8) {
      const nested = await withMembers(
        await toPresentation4<Collection>(await dereference(item, options)),
        options,
      );
      const found = await firstManifest(nested, options, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

/**
 * A resource as it is, upgraded: no Collection is opened and no content state followed.
 * What a standalone list of a Collection's members needs.
 */
export async function fetchResource(
  input: IIIFContent,
  { request, signal }: LoadOptions = {},
): Promise<Manifest | Collection> {
  void preloadUpgrader();
  const json =
    typeof input === "string"
      ? await fetchJson(request, input.trim(), signal)
      : input;
  const resource = await toPresentation4<Manifest | Collection>(json);
  return resource.type === "Collection"
    ? withMembers(resource as Collection, { request, signal })
    : resource;
}

export async function loadContent(
  input: IIIFContent,
  options: LoadContentOptions = {},
): Promise<Loaded> {
  const { request, signal } = options;
  // Load the upgrader alongside the first fetch, so upgrading adds no round trip.
  void preloadUpgrader();

  let target: Target | undefined;
  let json: unknown;

  /** A content state names what to load and where to go in it. */
  const followContentState = async (state: Record<string, any>) => {
    const resolved = resolveContentState(state);
    if (!resolved) throw new CloverContentError("Unreadable content state");
    target = resolved.target ?? target;
    return fetchJson(request, resolved.id, signal);
  };

  if (typeof input === "string") {
    if (isUrl(input.trim())) {
      json = await fetchJson(request, input.trim(), signal);
    } else {
      const state = decodeContentState(input);
      if (!state) throw new CloverContentError("Unreadable iiifContent");
      json = isContentState(state) ? await followContentState(state) : state;
    }
  } else {
    json = input;
  }
  // A URL may answer with a content state of its own.
  if (isContentState(json)) {
    json = await followContentState(json as Record<string, any>);
  }

  const resource = await toPresentation4<Record<string, any>>(json);
  signal?.throwIfAborted?.();

  switch (resource.type) {
    case "Manifest":
      return { manifest: resource as Manifest, target };
    case "Collection": {
      const collection = await withMembers(resource as Collection, options);
      const chosen = options.manifestId
        ? ((collection.items ?? []) as Json[]).find(
            (item) =>
              item.id === options.manifestId && item.type === "Manifest",
          )
        : undefined;
      const manifest = chosen
        ? await loadManifest(chosen, options)
        : await firstManifest(collection, options);
      if (!manifest) {
        throw new CloverContentError("The Collection holds no Manifest");
      }
      return { manifest, collection, target };
    }
    case "Canvas":
    case "Timeline": {
      const container = resource;
      target ??= { canvasId: container.id };
      const partOf = (container.partOf ?? []).find(
        (part: any) => part?.type === "Manifest" && part.id,
      );
      if (partOf) {
        const manifest = await toPresentation4<Manifest>(
          await fetchJson(request, partOf.id, signal),
        );
        return { manifest, target };
      }
      // A Canvas on its own: shown as a Manifest of one.
      const manifest = {
        "@context": P4_CONTEXT,
        id: container.id,
        type: "Manifest",
        label: container.label ?? { none: [""] },
        items: [container],
      } as unknown as Manifest;
      return { manifest, target };
    }
    default:
      throw new CloverContentError(
        `Cannot show a ${String(resource.type ?? "resource without a type")}`,
      );
  }
}
