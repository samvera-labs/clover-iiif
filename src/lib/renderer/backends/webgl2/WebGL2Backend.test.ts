import { WebGL2Backend } from "src/lib/renderer/backends/webgl2/WebGL2Backend";
import { IDENTITY } from "src/lib/renderer/math/affine";
import {
  canvasWithFakeGl,
  createFakeGl,
} from "src/lib/renderer/testing/fakeGl";

const bitmap = { width: 100, height: 50 } as unknown as ImageBitmap;

function command(overrides = {}) {
  return {
    key: "a",
    source: bitmap,
    width: 100,
    height: 50,
    transform: { ...IDENTITY },
    opacity: 1,
    ...overrides,
  };
}

describe("WebGL2Backend", () => {
  it("returns null where WebGL2 is unavailable", () => {
    const canvas = document.createElement("canvas");
    canvas.getContext = (() => null) as HTMLCanvasElement["getContext"];
    expect(WebGL2Backend.create(canvas)).toBeNull();
  });

  it("uploads a still image once and draws it every frame", () => {
    const fake = createFakeGl();
    const backend = WebGL2Backend.create(canvasWithFakeGl(fake))!;
    backend.resize(200, 100, 2);

    for (let frame = 0; frame < 3; frame++) {
      backend.begin();
      expect(backend.draw(command())).toBe("drawn");
      backend.end();
    }

    expect(fake.count("texImage2D")).toBe(1);
    expect(fake.count("generateMipmap")).toBe(1);
    expect(fake.count("drawArrays")).toBe(3);
    expect(backend.canvas.width).toBe(400);
  });

  it("re-uploads in place when a dynamic source's version changes", () => {
    const fake = createFakeGl();
    const backend = WebGL2Backend.create(canvasWithFakeGl(fake))!;
    backend.begin();
    backend.draw(command({ version: 1 }));
    backend.draw(command({ version: 1 }));
    backend.draw(command({ version: 2 }));
    backend.end();

    // Into the same texture: whole frames, since `texSubImage2D` from a video is black
    // in Chrome.
    expect(fake.count("createTexture")).toBe(1);
    expect(fake.count("texImage2D")).toBe(2);
    expect(fake.count("texSubImage2D")).toBe(0);
    // Video frames skip the mip chain.
    expect(fake.count("generateMipmap")).toBe(0);
  });

  it("reports cross-origin pixels as tainted rather than throwing", () => {
    const fake = createFakeGl();
    const backend = WebGL2Backend.create(canvasWithFakeGl(fake))!;
    fake.taint();
    backend.begin();
    expect(backend.draw(command())).toBe("tainted");
    backend.end();
    expect(fake.count("drawArrays")).toBe(0);
  });

  it("frees textures on release and gives the context back on dispose", () => {
    const fake = createFakeGl();
    const backend = WebGL2Backend.create(canvasWithFakeGl(fake))!;
    backend.begin();
    backend.draw(command());
    backend.end();
    backend.release("a");
    expect(fake.count("deleteTexture")).toBe(1);

    backend.dispose();
    expect(fake.loseContext).toHaveBeenCalled();
    expect(backend.lost).toBe(true);
    expect(backend.draw(command())).toBe("skipped");
  });

  it("skips drawing while the context is lost, and re-uploads once restored", () => {
    const fake = createFakeGl();
    const onRestored = vi.fn();
    const backend = WebGL2Backend.create(canvasWithFakeGl(fake), {
      onRestored,
    })!;
    backend.begin();
    backend.draw(command());
    backend.end();

    backend.canvas.dispatchEvent(
      new Event("webglcontextlost", { cancelable: true }),
    );
    expect(backend.draw(command())).toBe("skipped");

    backend.canvas.dispatchEvent(new Event("webglcontextrestored"));
    expect(onRestored).toHaveBeenCalled();
    backend.begin();
    backend.draw(command());
    backend.end();
    expect(fake.count("texImage2D")).toBe(2);
  });
});
