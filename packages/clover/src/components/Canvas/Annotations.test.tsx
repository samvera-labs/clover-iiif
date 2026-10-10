import { render } from "@testing-library/react";
import React from "react";

import { type CanvasAnnotation, placeAnnotations } from "./Annotations";
import { readSvgShape } from "../../core/svg-shape";
import { selectAnnotationSets } from "../../core/annotation-sets";
import pointJson from "../../fixtures/iiif-cookbook/0135-annotating-point-in-canvas.json";
import shapeJson from "../../fixtures/iiif-cookbook/0261-non-rectangular-commenting.json";
import { p4 } from "../../fixtures/presentation4";

const canvas = "https://example.org/canvas/1";
const annotation = (id: string, target: unknown): CanvasAnnotation => ({
  annotation: {
    id,
    type: "Annotation",
    motivation: ["commenting"],
    body: { type: "TextualBody", value: `About ${id}` },
    target,
  } as never,
  targetIndex: 0,
});

/** World units are the target's own, shifted, so placement is visible in the result. */
const place = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => ({
  ...rect,
  x: rect.x + 1000,
});

describe("placeAnnotations", () => {
  it("places rectangles, points and SVG shapes", () => {
    const placed = placeAnnotations(
      [
        annotation("rect", `${canvas}#xywh=10,20,30,40`),
        annotation("point", {
          type: "SpecificResource",
          source: canvas,
          selector: { type: "PointSelector", x: 500, y: 600 },
        }),
        annotation("shape", {
          type: "SpecificResource",
          source: { id: canvas, type: "Canvas" },
          selector: {
            type: "SvgSelector",
            value: '<svg><polygon points="100,100 200,100 150,250" /></svg>',
          },
        }),
      ],
      place,
      readSvgShape,
    );
    expect(placed.map((entry) => [entry.id, entry.shape?.kind])).toEqual([
      ["rect", undefined],
      ["point", "point"],
      ["shape", "svg"],
    ]);
    expect(placed[0].world).toEqual({ x: 1010, y: 20, width: 30, height: 40 });
    // A point frames a 40-unit box around itself.
    expect(placed[1].world).toEqual({ x: 1480, y: 580, width: 40, height: 40 });
    // A shape is placed by its box.
    expect(placed[2].world).toEqual({
      x: 1100,
      y: 100,
      width: 100,
      height: 150,
    });
    expect(placed[2].label).toBe("About shape");
  });

  it("skips a shape with nothing to draw", () => {
    const placed = placeAnnotations(
      [
        annotation("empty", {
          type: "SpecificResource",
          source: canvas,
          selector: { type: "SvgSelector", value: "<svg><g /></svg>" },
        }),
      ],
      place,
      readSvgShape,
    );
    expect(placed).toEqual([]);
  });
});

describe("a shape's hotspot", () => {
  it("draws the shape from its read geometry, sized by its box", async () => {
    const { default: Annotations } = await import("./Annotations");
    const container = document.createElement("div");
    const renderer = {
      overlays: { container, add: () => () => undefined },
      invalidate: () => undefined,
    } as never;
    const [entry] = placeAnnotations(
      [
        annotation("shape", {
          type: "SpecificResource",
          source: canvas,
          selector: {
            type: "SvgSelector",
            value:
              '<svg><path d="M10 10 L 60 10 L 35 80 Z" onclick="x()" /></svg>',
          },
        }),
      ],
      place,
      readSvgShape,
    );
    render(
      <Annotations
        renderer={renderer}
        placed={[entry]}
        sceneVersion={1}
        active={null}
        onActivate={() => undefined}
        onSelect={() => undefined}
      />,
    );
    const button = container.querySelector("button")!;
    expect(button).toHaveAttribute("data-shape", "svg");
    expect(button).toHaveAccessibleName("About shape");
    const svg = button.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("10 10 50 70");
    const path = svg.querySelector("path")!;
    expect(path.getAttribute("d")).toBe("M10 10 L 60 10 L 35 80 Z");
    expect(path.hasAttribute("onclick")).toBe(false);
  });
});

describe("the Cookbook's shapes and points, through Presentation 4", () => {
  it.each([
    ["0261 (SvgSelector)", shapeJson, "svg"],
    ["0135 (PointSelector)", pointJson, "point"],
  ])("%s places as its kind", (_, json, kind) => {
    const entries = selectAnnotationSets(p4(json), []).flatMap(
      (set) => set.entries,
    );
    const placed = placeAnnotations(
      entries.map((entry) => ({
        annotation: entry.annotation as never,
        targetIndex: 0,
      })),
      (rect) => rect,
      readSvgShape,
    );
    expect(placed.length).toBeGreaterThan(0);
    expect(placed[0].shape?.kind).toBe(kind);
    expect(placed[0].world.width).toBeGreaterThan(0);
  });
});

describe("the SVG reader", () => {
  it("waits for its reader: shapes are placed only once it has loaded", () => {
    const shape = annotation("shape", {
      type: "SpecificResource",
      source: canvas,
      selector: {
        type: "SvgSelector",
        value: '<svg><polygon points="0,0 10,0 10,10" /></svg>',
      },
    });
    expect(placeAnnotations([shape], place)).toEqual([]);
    expect(placeAnnotations([shape], place, readSvgShape)).toHaveLength(1);
  });
});
