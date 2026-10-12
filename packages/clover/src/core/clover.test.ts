import bookJson from "../fixtures/iiif-cookbook/0009-book-1.json";
import { createClover } from "./clover";
import { selectSequence, selectVisibleCanvases } from "./selectors";

const BOOK = bookJson.id;
const canvasIds = bookJson.items.map((canvas) => canvas.id);

/** A fetch answering from a table of URLs, recording every request. */
function mockFetch(table: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    const body = table[url];
    return body === undefined
      ? new Response("missing", { status: 404 })
      : new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
  });
}

const encode = (json: unknown) =>
  btoa(encodeURIComponent(JSON.stringify(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

describe("createClover: loading", () => {
  it("loads a Manifest URL once, with the request settings, as Presentation 4", async () => {
    const fetch = mockFetch({ [BOOK]: bookJson });
    const clover = createClover({
      request: {
        fetch,
        credentials: "include",
        headers: { Authorization: "Bearer t" },
      },
    });
    await clover.load(BOOK);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.credentials).toBe("include");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer t",
    );
    const { status, manifest, canvasId } = clover.store.get();
    expect(status).toBe("ready");
    expect(manifest?.["@context"]).toContain("presentation/4");
    expect(canvasId).toBe(canvasIds[0]);
  });

  it("takes a resource object without fetching it", async () => {
    const fetch = mockFetch({});
    const clover = createClover({ request: { fetch } });
    await clover.load(bookJson);
    expect(fetch).not.toHaveBeenCalled();
    expect(clover.store.get().manifest?.id).toBe(BOOK);
  });

  it("upgrades Presentation 2", async () => {
    const clover = createClover();
    await clover.load({
      "@context": "http://iiif.io/api/presentation/2/context.json",
      "@id": "https://example.org/p2",
      "@type": "sc:Manifest",
      label: "Two",
      sequences: [
        {
          "@type": "sc:Sequence",
          canvases: [
            {
              "@id": "https://example.org/p2/c1",
              "@type": "sc:Canvas",
              label: "One",
              width: 10,
              height: 10,
              images: [],
            },
          ],
        },
      ],
    });
    const { manifest, canvasId } = clover.store.get();
    expect(manifest?.type).toBe("Manifest");
    expect(canvasId).toBe("https://example.org/p2/c1");
  });

  it("follows an encoded content state to its Manifest, Canvas and region", async () => {
    const fetch = mockFetch({ [BOOK]: bookJson });
    const clover = createClover({ request: { fetch } });
    await clover.load(
      encode({
        type: "Annotation",
        motivation: ["contentState"],
        target: {
          type: "SpecificResource",
          source: {
            id: canvasIds[2],
            type: "Canvas",
            partOf: [{ id: BOOK, type: "Manifest" }],
          },
          selector: { type: "FragmentSelector", value: "xywh=1,2,3,4" },
        },
      }),
    );
    const { canvasId, target } = clover.store.get();
    expect(canvasId).toBe(canvasIds[2]);
    expect(target).toEqual({
      canvasId: canvasIds[2],
      region: { x: 1, y: 2, w: 3, h: 4 },
    });
  });

  it("shows a Collection's first Manifest, fetching it when only referenced", async () => {
    const collection = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/collection",
      type: "Collection",
      label: { none: ["Shelf"] },
      items: [{ id: BOOK, type: "Manifest", label: { none: ["Book"] } }],
    };
    const fetch = mockFetch({ [BOOK]: bookJson });
    const clover = createClover({ request: { fetch } });
    await clover.load(collection);
    const { manifest, collection: held } = clover.store.get();
    expect(held?.id).toBe(collection.id);
    expect(manifest?.items).toHaveLength(bookJson.items.length);
  });

  it("shows a lone Canvas as a Manifest of one", async () => {
    const clover = createClover();
    await clover.load({
      "@context": "http://iiif.io/api/presentation/3/context.json",
      ...bookJson.items[1],
    });
    const { manifest, canvasId } = clover.store.get();
    expect(manifest?.items).toHaveLength(1);
    expect(canvasId).toBe(canvasIds[1]);
  });

  it("reports an error, and a later load replaces an earlier one", async () => {
    const fetch = mockFetch({ [BOOK]: bookJson });
    const clover = createClover({ request: { fetch } });
    await clover.load("https://example.org/missing");
    expect(clover.store.get().status).toBe("error");

    const first = clover.load("https://example.org/missing");
    const second = clover.load(BOOK);
    await Promise.all([first, second]);
    expect(clover.store.get().status).toBe("ready");
  });
});

describe("createClover: navigation", () => {
  it("steps by view: spreads of a paged book, no wrap", async () => {
    const clover = createClover();
    await clover.load(bookJson);
    const { views } = selectSequence(clover.store.get().manifest);
    expect(views.length).toBeLessThan(canvasIds.length);

    clover.previous();
    expect(clover.store.get().canvasId).toBe(canvasIds[0]);
    clover.next();
    expect(clover.store.get().canvasId).toBe(canvasIds[1]);
    const shown = selectVisibleCanvases(
      clover.store.get().manifest,
      clover.store.get().canvasId,
    );
    expect(shown.map((canvas) => canvas.id)).toEqual(canvasIds.slice(1, 3));

    clover.last();
    clover.next();
    expect(clover.store.get().canvasId).toBe(
      canvasIds[views[views.length - 1][0]],
    );
    clover.next({ wrap: true });
    expect(clover.store.get().canvasId).toBe(canvasIds[0]);
  });

  it("returns the same visible array while nothing changes", async () => {
    const clover = createClover();
    await clover.load(bookJson);
    const { manifest, canvasId } = clover.store.get();
    expect(selectVisibleCanvases(manifest, canvasId)).toBe(
      selectVisibleCanvases(manifest, canvasId),
    );
  });

  it("asks a controlled host instead of moving", async () => {
    const onCanvasChange = vi.fn();
    const clover = createClover({ onCanvasChange, isControlled: () => true });
    await clover.load(bookJson, { canvasId: canvasIds[0] });
    onCanvasChange.mockClear();
    clover.next();
    expect(onCanvasChange).toHaveBeenCalledWith(canvasIds[1]);
    expect(clover.store.get().canvasId).toBe(canvasIds[0]);
    clover.syncCanvas(canvasIds[1]);
    expect(clover.store.get().canvasId).toBe(canvasIds[1]);
  });

  it("lets the host's canvasId win over a default", async () => {
    const clover = createClover();
    await clover.load(bookJson, {
      canvasId: canvasIds[3],
      defaultCanvasId: canvasIds[1],
    });
    expect(clover.store.get().canvasId).toBe(canvasIds[3]);
  });
});

describe("createClover: referenced annotation pages", () => {
  it("embeds a shown Canvas's referenced page, replacing only its path", async () => {
    const pageId = "https://example.org/pages/1";
    const manifest = {
      ...bookJson,
      items: bookJson.items.map((canvas, index) =>
        index === 0
          ? { ...canvas, annotations: [{ id: pageId, type: "AnnotationPage" }] }
          : canvas,
      ),
    };
    const fetch = mockFetch({
      [pageId]: {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: pageId,
        type: "AnnotationPage",
        items: [
          {
            id: `${pageId}/a`,
            type: "Annotation",
            motivation: "commenting",
            body: { type: "TextualBody", value: "Hello" },
            target: `${canvasIds[0]}#xywh=1,2,3,4`,
          },
        ],
      },
    });
    const clover = createClover({ request: { fetch } });
    await clover.load(manifest);
    const before = clover.store.get().manifest!;
    await vi.waitFor(() =>
      expect(clover.store.get().manifest).not.toBe(before),
    );
    const after = clover.store.get().manifest! as any;
    const page = after.items[0].annotations[0];
    expect(page.items[0].motivation).toEqual(["commenting"]);
    expect(after.items[1]).toBe((before as any).items[1]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("createClover: Collections", () => {
  const LETTER = "https://example.org/letter";
  const letter = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: LETTER,
    type: "Manifest",
    label: { none: ["Letter"] },
    items: [
      {
        id: `${LETTER}/canvas/1`,
        type: "Canvas",
        width: 100,
        height: 100,
        items: [],
      },
    ],
  };
  const member = (id: string, type = "Manifest") => ({
    id,
    type,
    label: { none: [id] },
  });
  const shelf = (items: unknown[]) => ({
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/shelf",
    type: "Collection",
    label: { none: ["Shelf"] },
    items,
  });

  it("gathers a paged Collection's members from first through next", async () => {
    const fetch = mockFetch({
      "https://example.org/shelf/page/2": {
        id: "https://example.org/shelf/page/2",
        type: "CollectionPage",
        items: [member(LETTER)],
      },
      [BOOK]: bookJson,
    });
    const clover = createClover({ request: { fetch } });
    await clover.load({
      ...shelf([]),
      items: undefined,
      first: {
        id: "https://example.org/shelf/page/1",
        type: "CollectionPage",
        items: [member(BOOK)],
        next: "https://example.org/shelf/page/2",
      },
    });
    const { collection, manifest } = clover.store.get();
    expect(collection?.items?.map((item: any) => item.id)).toEqual([
      BOOK,
      LETTER,
    ]);
    expect(manifest?.id).toBe(BOOK);
  });

  it("opens the member a host names, without fetching the first", async () => {
    const fetch = mockFetch({ [BOOK]: bookJson, [LETTER]: letter });
    const clover = createClover({ request: { fetch } });
    await clover.load(shelf([member(BOOK), member(LETTER)]), {
      manifestId: LETTER,
    });
    expect(clover.store.get().manifest?.id).toBe(LETTER);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("opens the member a content state names, among its Collection's members", async () => {
    const SHELF = "https://example.org/shelf";
    const fetch = mockFetch({
      [SHELF]: shelf([member(BOOK), member(LETTER)]),
      [BOOK]: bookJson,
      [LETTER]: letter,
    });
    const clover = createClover({ request: { fetch } });
    await clover.load(
      encode({
        type: "Annotation",
        motivation: ["contentState"],
        target: {
          id: LETTER,
          type: "Manifest",
          partOf: [{ id: SHELF, type: "Collection" }],
        },
      }),
    );
    const { manifest, collection } = clover.store.get();
    expect(collection?.id).toBe(SHELF);
    expect(manifest?.id).toBe(LETTER);
    // The Collection, then the member it names: never its first.
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([SHELF, LETTER]);
  });

  it("goes to a Canvas of a Collection's member, the Collection kept", async () => {
    const SHELF = "https://example.org/shelf";
    const fetch = mockFetch({
      [SHELF]: shelf([member(LETTER), member(BOOK)]),
      [BOOK]: bookJson,
    });
    const clover = createClover({ request: { fetch } });
    await clover.load(
      encode({
        type: "Annotation",
        motivation: ["contentState"],
        target: {
          id: canvasIds[1],
          type: "Canvas",
          partOf: [
            {
              id: BOOK,
              type: "Manifest",
              partOf: [{ id: SHELF, type: "Collection" }],
            },
          ],
        },
      }),
    );
    const { manifest, collection, canvasId } = clover.store.get();
    expect(collection?.id).toBe(SHELF);
    expect(manifest?.id).toBe(BOOK);
    expect(canvasId).toBe(canvasIds[1]);
  });

  it("goes to another member, keeping the Collection and reporting it", async () => {
    const fetch = mockFetch({ [BOOK]: bookJson, [LETTER]: letter });
    const onManifestChange = vi.fn();
    const onCanvasChange = vi.fn();
    const clover = createClover({
      request: { fetch },
      onManifestChange,
      onCanvasChange,
    });
    await clover.load(shelf([member(BOOK), member(LETTER)]));
    await clover.goToManifest(LETTER);
    const { manifest, collection, canvasId, status } = clover.store.get();
    expect(status).toBe("ready");
    expect(manifest?.id).toBe(LETTER);
    expect(collection?.id).toBe("https://example.org/shelf");
    expect(canvasId).toBe(`${LETTER}/canvas/1`);
    expect(onManifestChange).toHaveBeenCalledWith(LETTER);
    expect(onCanvasChange).toHaveBeenLastCalledWith(`${LETTER}/canvas/1`);

    await clover.goToManifest(LETTER);
    expect(onManifestChange).toHaveBeenCalledTimes(1);
  });

  it("enters a nested Collection, showing its first Manifest", async () => {
    const NESTED = "https://example.org/drawer";
    const fetch = mockFetch({
      [BOOK]: bookJson,
      [LETTER]: letter,
      [NESTED]: { ...shelf([member(LETTER)]), id: NESTED },
    });
    const onManifestChange = vi.fn();
    const clover = createClover({ request: { fetch }, onManifestChange });
    await clover.load(shelf([member(BOOK), member(NESTED, "Collection")]));
    await clover.goToManifest(NESTED);
    const { manifest, collection } = clover.store.get();
    expect(collection?.id).toBe(NESTED);
    expect(manifest?.id).toBe(LETTER);
    expect(onManifestChange).toHaveBeenCalledWith(LETTER);
  });

  it("asks a controlled host, and moves only when it hands the id back", async () => {
    const fetch = mockFetch({ [BOOK]: bookJson, [LETTER]: letter });
    const onManifestChange = vi.fn();
    const clover = createClover({
      request: { fetch },
      onManifestChange,
      isManifestControlled: () => true,
    });
    await clover.load(shelf([member(BOOK), member(LETTER)]));
    await clover.goToManifest(LETTER);
    expect(onManifestChange).toHaveBeenCalledWith(LETTER);
    expect(clover.store.get().manifest?.id).toBe(BOOK);

    await clover.syncManifest(LETTER);
    expect(clover.store.get().manifest?.id).toBe(LETTER);
    expect(onManifestChange).toHaveBeenCalledTimes(1);
  });
});
