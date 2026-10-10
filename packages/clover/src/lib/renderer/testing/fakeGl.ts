/**
 * A WebGL2 context that records what it is asked to do.
 *
 * jsdom has no GPU, and a native headless-gl would test the driver rather than the
 * renderer. What the renderer is responsible for is the sequence of calls — upload once,
 * re-upload in place, draw per item, give the context back — and that is what this keeps.
 */
export interface FakeGl {
  gl: WebGL2RenderingContext;
  calls: Array<{ name: string; args: unknown[] }>;
  count(name: string): number;
  /** Make the next uploads throw, as `texImage2D` does with cross-origin pixels. */
  taint(on?: boolean): void;
  loseContext: ReturnType<typeof vi.fn>;
}

export function createFakeGl(): FakeGl {
  const calls: FakeGl["calls"] = [];
  let tainted = false;
  let ids = 0;
  const loseContext = vi.fn();

  const overrides: Record<string, unknown> = {
    getParameter: () => 4096,
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getUniformLocation: (_: unknown, name: string) => ({ name }),
    getAttribLocation: () => 0,
    getExtension: (name: string) =>
      name === "WEBGL_lose_context" ? { loseContext } : null,
    createShader: () => ({ id: ++ids }),
    createProgram: () => ({ id: ++ids }),
    createBuffer: () => ({ id: ++ids }),
    createVertexArray: () => ({ id: ++ids }),
    createTexture: () => ({ id: ++ids }),
    texImage2D: () => {
      if (tainted) {
        const error = new Error("The image element contains cross-origin data");
        error.name = "SecurityError";
        throw error;
      }
    },
  };

  const gl = new Proxy({} as WebGL2RenderingContext, {
    get(_, prop: string) {
      // Constants: any stable number will do.
      if (/^[A-Z0-9_]+$/.test(prop)) return hash(prop);
      return (...args: unknown[]) => {
        calls.push({ name: prop, args });
        const override = overrides[prop];
        return typeof override === "function" ? override(...args) : undefined;
      };
    },
  });

  return {
    gl,
    calls,
    count: (name) => calls.filter((call) => call.name === name).length,
    taint: (on = true) => {
      tainted = on;
    },
    loseContext,
  };
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A canvas whose `getContext("webgl2")` returns the fake. */
export function canvasWithFakeGl(fake: FakeGl): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.getContext = ((type: string) =>
    type === "webgl2" ? fake.gl : null) as HTMLCanvasElement["getContext"];
  return canvas;
}
