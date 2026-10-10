import { pathExtent, readSvgShape } from "./svg-shape";

describe("readSvgShape", () => {
  it("reads a polygon's points and the box they fill", () => {
    const shape = readSvgShape(
      '<svg xmlns="http://www.w3.org/2000/svg"><polygon points="100,50 300,60 250,400 90,380" /></svg>',
    );
    expect(shape?.box).toEqual({ x: 90, y: 50, width: 210, height: 350 });
    expect(shape?.shapes).toEqual([
      {
        tag: "polygon",
        attributes: { points: "100,50 300,60 250,400 90,380" },
      },
    ]);
  });

  it("follows a path's commands, relative ones included", () => {
    // Annotorious draws freehand shapes as relative paths.
    const shape = readSvgShape(
      '<svg><path d="M10 10 l 20 0 v 30 h -20 z m 100 100 c 10 0 20 10 20 20" /></svg>',
    );
    expect(shape?.box).toEqual({ x: 10, y: 10, width: 120, height: 120 });
  });

  it("reads circles, ellipses, rects and lines", () => {
    const shape = readSvgShape(
      '<svg><circle cx="50" cy="50" r="10" /><ellipse cx="200" cy="50" rx="20" ry="5" /><rect x="0" y="100" width="10" height="10" /><line x1="300" y1="0" x2="310" y2="200" /></svg>',
    );
    expect(shape?.shapes.map((s) => s.tag)).toEqual([
      "circle",
      "ellipse",
      "rect",
      "line",
    ]);
    expect(shape?.box).toEqual({ x: 0, y: 0, width: 310, height: 200 });
  });

  it("keeps geometry only: no scripts, foreign objects, handlers or styles", () => {
    const shape = readSvgShape(
      `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
        <script>alert(1)</script>
        <foreignObject><div>x</div></foreignObject>
        <polygon points="0,0 10,0 10,10" onclick="alert(1)" style="fill:url(javascript:alert(1))" class="x" />
        <path d="M0 0 L10 10 javascript:alert(1)" />
      </svg>`,
    );
    expect(shape?.shapes).toEqual([
      { tag: "polygon", attributes: { points: "0,0 10,0 10,10" } },
    ]);
  });

  it("is null for markup with nothing to draw, or not SVG at all", () => {
    expect(readSvgShape("<svg><g /></svg>")).toBeNull();
    expect(readSvgShape("<svg><polygon points=")).toBeNull();
    expect(readSvgShape("")).toBeNull();
  });
});

describe("pathExtent", () => {
  it("takes an arc's ends and radii", () => {
    const points = pathExtent("M 0 0 A 10 10 0 0 1 20 0");
    const xs = points.map(([x]) => x);
    expect(Math.min(...xs)).toBe(-10);
    expect(Math.max(...xs)).toBe(30);
  });
});
