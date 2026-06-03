import {
  getLanguageDirection,
  getTargetCanvasId,
  parseAnnotationTarget,
  filterAnnotationsByMotivation,
  AnnotationTargetExtended,
  resolveAnnotationBodies,
} from "./annotation-helpers";

import { manifestAnnotationsMotivations } from "src/fixtures/viewer/annotations/manifest-motivations";

describe("getLanguageDirection", () => {
  it("returns 'RTL' for Arabic", () => {
    const result = getLanguageDirection("ar");
    expect(result).toEqual("RTL");
  });
  it("returns 'RTL' for Hebrew", () => {
    const result = getLanguageDirection("he");
    expect(result).toEqual("RTL");
  });
  it("returns 'LTR' for English", () => {
    const result = getLanguageDirection("en");
    expect(result).toEqual("LTR");
  });
  it("returns 'LTR' for French", () => {
    const result = getLanguageDirection("fr");
    expect(result).toEqual("LTR");
  });
  it("returns 'RTL' for Persian", () => {
    const result = getLanguageDirection("fa");
    expect(result).toEqual("RTL");
  });
  it("returns 'RTL' for Urdu", () => {
    const result = getLanguageDirection("ur");
    expect(result).toEqual("RTL");
  });
  it("returns 'LTR' for Spanish", () => {
    const result = getLanguageDirection("es");
    expect(result).toEqual("LTR");
  });
  it("returns 'LTR' for German", () => {
    const result = getLanguageDirection("de");
    expect(result).toEqual("LTR");
  });
  it("returns 'RTL' for Kurdish", () => {
    const result = getLanguageDirection("ku");
    expect(result).toEqual("RTL");
  });
  it("returns 'RTL' for Pashto", () => {
    const result = getLanguageDirection("ps");
    expect(result).toEqual("RTL");
  });
  it("returns 'RTL' for Divehi", () => {
    const result = getLanguageDirection("dv");
    expect(result).toEqual("RTL");
  });
});

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

  it("handles target strings with t using query param style (&t=)", () => {
    const target = "http://example.com/canvas/1&t=0,2";

    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      t: "0,2",
    };
    expect(result).toEqual(expected);
  });

  it("handles vault-normalized SpecificResource with &t= in source id (no selector)", () => {
    const target = {
      type: "SpecificResource" as const,
      source: { id: "http://example.com/canvas/1&t=0,2", type: "Canvas" as const },
    };

    // @ts-ignore - testing non-standard vault normalization shape
    const result = parseAnnotationTarget(target);

    const expected = {
      id: "http://example.com/canvas/1",
      t: "0,2",
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

describe("filterAnnotationsByMotivation", () => {
  const textualAnnotations = manifestAnnotationsMotivations.items
    .flatMap((canvas) => canvas.annotations || [])
    .flatMap((page) => page.items || []);

  const totalAnnotations = textualAnnotations.length;
  const commentingCount = textualAnnotations.filter(
    (annotation) => annotation.motivation === "commenting",
  ).length;
  const taggingCount = textualAnnotations.filter(
    (annotation) => annotation.motivation === "tagging",
  ).length;

  it("returns all annotations when motivations option is omitted", () => {
    const filtered = filterAnnotationsByMotivation(textualAnnotations);
    expect(filtered).toHaveLength(totalAnnotations);
  });

  it("returns all annotations when multiple motivations are provided", () => {
    const filtered = filterAnnotationsByMotivation(textualAnnotations, [
      "commenting",
      "tagging",
    ]);
    expect(filtered).toHaveLength(totalAnnotations);
  });

  it("returns only annotations that match a single motivation", () => {
    const filtered = filterAnnotationsByMotivation(textualAnnotations, [
      "tagging",
    ]);
    expect(filtered).toHaveLength(taggingCount);
    expect(filtered.every((annotation) => annotation.motivation === "tagging"))
      .toBe(true);
  });

  it("returns no annotations when motivations are explicitly empty", () => {
    const filtered = filterAnnotationsByMotivation(textualAnnotations, []);
    expect(filtered).toHaveLength(0);
  });
});

describe("getTargetCanvasId", () => {
  it("extracts canvas ID from a plain string target", () => {
    expect(getTargetCanvasId("https://example.org/canvas/1")).toBe(
      "https://example.org/canvas/1",
    );
  });

  it("strips #xywh fragment from a string target", () => {
    expect(
      getTargetCanvasId("https://example.org/canvas/1#xywh=100,200,300,400"),
    ).toBe("https://example.org/canvas/1");
  });

  it("strips #t= temporal fragment from a string target", () => {
    expect(
      getTargetCanvasId("https://example.org/canvas/1#t=0,10"),
    ).toBe("https://example.org/canvas/1");
  });

  it("extracts canvas ID from { source: 'string' }", () => {
    expect(
      getTargetCanvasId({ source: "https://example.org/canvas/1" }),
    ).toBe("https://example.org/canvas/1");
  });

  it("extracts canvas ID from { source: { id: 'string' } }", () => {
    expect(
      getTargetCanvasId({ source: { id: "https://example.org/canvas/1" } }),
    ).toBe("https://example.org/canvas/1");
  });

  it("extracts canvas ID from { id: 'string' }", () => {
    expect(
      getTargetCanvasId({ id: "https://example.org/canvas/1" }),
    ).toBe("https://example.org/canvas/1");
  });

  it("extracts canvas ID from first element of an array target", () => {
    expect(
      getTargetCanvasId(["https://example.org/canvas/1#xywh=0,0,100,100"]),
    ).toBe("https://example.org/canvas/1");
  });

  it("returns undefined for null/undefined", () => {
    expect(getTargetCanvasId(null)).toBeUndefined();
    expect(getTargetCanvasId(undefined)).toBeUndefined();
  });
});

describe("resolveAnnotationBodies", () => {
  it("returns textual body when body is a single object", () => {
    const annotation = {
      body: {
        type: "TextualBody",
        value: "hello",
        format: "text/plain",
      },
    };

    const result = resolveAnnotationBodies(annotation as any);
    expect(result).toHaveLength(1);
    expect((result[0] as any).value).toBe("hello");
  });

  it("resolves string body references through vault", () => {
    const body = {
      id: "https://example.org/body/1",
      type: "TextualBody",
      value: "resolved",
      format: "text/plain",
    };
    const vault = {
      get: vi.fn().mockReturnValue(body),
    } as any;

    const annotation = { body: body.id };
    const result = resolveAnnotationBodies(annotation as any, vault);

    expect(result).toHaveLength(1);
    expect((result[0] as any).id).toBe(body.id);
  });
});

