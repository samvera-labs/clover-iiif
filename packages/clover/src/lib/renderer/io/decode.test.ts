import { loadImage } from "./decode";

describe("loadImage", () => {
  const original = globalThis.createImageBitmap;
  beforeEach(() => {
    globalThis.createImageBitmap = vi.fn(async () => ({
      width: 4,
      height: 3,
      close: vi.fn(),
    })) as any;
  });
  afterEach(() => {
    globalThis.createImageBitmap = original;
  });

  it("asks for a tile with the request's credentials, headers and fetch", async () => {
    const fetch = vi.fn(
      async () => new Response(new Blob(["x"], { type: "image/jpeg" })),
    );
    await loadImage("https://example.org/tile.jpg", {
      request: {
        fetch,
        credentials: "include",
        headers: { Authorization: "Bearer t" },
      },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.org/tile.jpg");
    expect(init).toMatchObject({
      mode: "cors",
      credentials: "include",
      headers: { Authorization: "Bearer t" },
    });
  });
});
