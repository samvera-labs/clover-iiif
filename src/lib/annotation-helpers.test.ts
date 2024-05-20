import {
  parseAnnotationTarget,
  AnnotationTargetExtended,
} from "./annotation-helpers";

describe("parseAnnotationTarget", () => {
  it("handles target strings with xywh", () => {
    const target = "http://example.com/canvas/1#xywh=100,200,300,400";

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      rect: {
        x: 100,
        y: 200,
        w: 300,
        h: 400,
      },
    };
    expect(result).toEqual(expected);
  });

  it("handles target strings with t", () => {
    const target = "http://example.com/canvas/1#t=100";

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      t: "100",
    };
    expect(result).toEqual(expected);
  });

  it("handles target objects with PointSelector", () => {
    const target: AnnotationTargetExtended = {
      type: "SpecificResource",
      source: "http://example.com/canvas/1",
      selector: {
        type: "PointSelector",
        x: 100,
        y: 200,
      },
    };

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      point: {
        x: 100,
        y: 200,
      },
    };
    expect(result).toEqual(expected);
  });

  it("handles target objects with SvgSelector", () => {
    const target: AnnotationTargetExtended = {
      type: "SpecificResource",
      source: "http://example.com/canvas/1",
      selector: {
        type: "SvgSelector",
        value:
          '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>',
      },
    };

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>',
    };
    expect(result).toEqual(expected);
  });

  it("handles target objects with FragmentSelector and xywh", () => {
    const target: AnnotationTargetExtended = {
      type: "SpecificResource",
      source: {
        id: "http://example.com/canvas/1",
        type: "Canvas",
        partOf: [
          {
            id: "http://example.com/manifest.json",
            type: "Manifest",
          },
        ],
      },
      selector: {
        conformsTo: "http://www.w3.org/TR/media-frags/",
        type: "FragmentSelector",
        value: "xywh=100,200,300,400",
      },
    };

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      rect: {
        x: 100,
        y: 200,
        w: 300,
        h: 400,
      },
    };
    expect(result).toEqual(expected);
  });
});
