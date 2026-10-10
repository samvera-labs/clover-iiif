import { parseAnnotationTarget } from "./annotations";

const canvas = "https://example.org/canvas/1";

describe("parseAnnotationTarget", () => {
  it("reads a URI with and without a fragment", () => {
    expect(parseAnnotationTarget(canvas)).toEqual({ id: canvas });
    expect(parseAnnotationTarget(`${canvas}#xywh=10,20,30,40`)).toEqual({
      id: canvas,
      rect: { x: 10, y: 20, w: 30, h: 40 },
    });
    expect(parseAnnotationTarget(`${canvas}#t=5,10`)).toEqual({
      id: canvas,
      t: "5,10",
    });
    expect(parseAnnotationTarget(`${canvas}&t=5`)).toEqual({
      id: canvas,
      t: "5",
    });
  });

  it("reads a Presentation 4 reference, whose id carries the fragment", () => {
    expect(
      parseAnnotationTarget({
        id: `${canvas}#xywh=pixel:1,2,3,4`,
        type: "Canvas",
      }),
    ).toEqual({ id: canvas, rect: { x: 1, y: 2, w: 3, h: 4 } });
  });

  it("reads a SpecificResource's selectors", () => {
    const source = { id: canvas, type: "Canvas" };
    expect(
      parseAnnotationTarget({
        type: "SpecificResource",
        source,
        selector: { type: "FragmentSelector", value: "xywh=1,2,3,4" },
      }),
    ).toEqual({ id: canvas, rect: { x: 1, y: 2, w: 3, h: 4 } });
    expect(
      parseAnnotationTarget({
        type: "SpecificResource",
        source,
        selector: [{ type: "PointSelector", x: 5, y: 6 }],
      }),
    ).toEqual({ id: canvas, point: { x: 5, y: 6 } });
    expect(
      parseAnnotationTarget({
        type: "SpecificResource",
        source: canvas,
        selector: { type: "SvgSelector", value: "<svg/>" },
      }),
    ).toEqual({ id: canvas, svg: "<svg/>" });
  });

  it("falls back to the source when no selector applies", () => {
    expect(
      parseAnnotationTarget({
        type: "SpecificResource",
        source: { id: `${canvas}&t=12` },
      }),
    ).toEqual({ id: canvas, t: "12" });
  });
});
