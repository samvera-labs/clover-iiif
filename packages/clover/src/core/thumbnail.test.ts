import bookJson from "../fixtures/iiif-cookbook/0009-book-1.json";
import placeholderJson from "../fixtures/iiif-cookbook/0013-placeholderCanvas.json";
import { p4 } from "../fixtures/presentation4";
import { clearInfoCache } from "../lib/renderer/sources/imageService";
import { resolveThumbnail, thumbnailSource } from "./thumbnail";

const book = p4(bookJson);
const placeholder = p4(placeholderJson);

describe("thumbnailSource", () => {
  it("asks a level 1 or 2 service for a sized image at once", () => {
    const source = thumbnailSource(book.items[0], 200);
    expect(source?.src).toMatch(/\/full\/!200,200\/0\/default\.jpg$/);
  });

  it("prefers a resource's own thumbnail", () => {
    expect(
      thumbnailSource({
        thumbnail: [{ id: "https://example.org/t.jpg", type: "Image" }],
        items: book.items[0].items,
      }),
    ).toEqual({ src: "https://example.org/t.jpg" });
  });

  it("falls back to a video's placeholder image", () => {
    expect(thumbnailSource(placeholder.items[0])?.src).toMatch(
      /act1-thumbnail\.png$/,
    );
  });

  it("needs info.json for a level 0 service, keeping the image as a fallback", () => {
    expect(
      thumbnailSource({
        thumbnail: [
          {
            id: "https://example.org/static/full.jpg",
            type: "Image",
            service: [
              {
                id: "https://example.org/static",
                type: "ImageService3",
                profile: "level0",
              },
            ],
          },
        ],
      }),
    ).toEqual({
      service: "https://example.org/static",
      fallback: "https://example.org/static/full.jpg",
    });
  });
});

describe("resolveThumbnail", () => {
  afterEach(() => clearInfoCache());

  it("picks the smallest listed size that fills the request, with the request settings", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            "@context": "http://iiif.io/api/image/3/context.json",
            id: "https://example.org/static",
            type: "ImageService3",
            protocol: "http://iiif.io/api/image",
            profile: "level0",
            width: 4000,
            height: 3000,
            sizes: [
              { width: 125, height: 94 },
              { width: 250, height: 188 },
              { width: 500, height: 375 },
            ],
          }),
        ),
    );
    const url = await resolveThumbnail(
      { service: "https://example.org/static", fallback: "x.jpg" },
      200,
      { fetch, credentials: "include" },
    );
    expect(url).toBe("https://example.org/static/full/250,188/0/default.jpg");
    expect((fetch.mock.calls[0] as unknown[])[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("uses the fallback when info.json fails", async () => {
    const fetch = vi.fn(async () => new Response("no", { status: 500 }));
    expect(
      await resolveThumbnail(
        { service: "https://example.org/broken", fallback: "x.jpg" },
        200,
        { fetch },
      ),
    ).toBe("x.jpg");
  });
});
