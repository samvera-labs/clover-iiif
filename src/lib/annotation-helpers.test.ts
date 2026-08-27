import {
  getLanguageDirection,
  parseAnnotationTarget,
  filterAnnotationsByMotivation,
  isCaptionResource,
  AnnotationTargetExtended,
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

describe("isCaptionResource", () => {
  it("accepts a WebVTT resource declared by format", () => {
    expect(
      isCaptionResource({
        id: "https://example.org/captions.vtt",
        type: "Text",
        format: "text/vtt",
      }),
    ).toBe(true);
  });

  it("falls back to the file extension when no format is declared", () => {
    expect(isCaptionResource({ id: "https://example.org/c.vtt" })).toBe(true);
    expect(isCaptionResource({ id: "https://example.org/c.vtt?v=2" })).toBe(
      true,
    );
    expect(isCaptionResource({ id: "https://example.org/notes.txt" })).toBe(
      false,
    );
  });

  it("rejects an embedded TextualBody", () => {
    expect(
      isCaptionResource({
        id: "https://example.org/annotation/1/body",
        type: "TextualBody",
        format: "text/plain",
      }),
    ).toBe(false);
  });

  it("rejects a Vault-minted id for a body with no id of its own", () => {
    expect(isCaptionResource({ id: "vault://57a8c405" })).toBe(false);
  });

  it("rejects a body with no id", () => {
    expect(isCaptionResource({})).toBe(false);
    expect(isCaptionResource(undefined)).toBe(false);
  });

  it("rejects a resource whose declared format is not a caption format", () => {
    expect(
      isCaptionResource({
        id: "https://example.org/video.mp4",
        type: "Video",
        format: "video/mp4",
      }),
    ).toBe(false);
  });

  /* The Presentation API says `format` "should be the value of the Content-Type
     header returned when the resource is dereferenced", and that header
     routinely carries a charset parameter. Comparing the raw string dropped
     these captions. */
  it("accepts a caption format that carries parameters", () => {
    expect(
      isCaptionResource({
        id: "https://example.org/captions",
        type: "Text",
        format: "text/vtt; charset=utf-8",
      }),
    ).toBe(true);
    expect(
      isCaptionResource({
        id: "https://example.org/captions",
        format: "TEXT/VTT ; charset=UTF-8",
      }),
    ).toBe(true);
  });

  it("accepts the non-standard text/webvtt published in the wild", () => {
    expect(
      isCaptionResource({ id: "https://example.org/c", format: "text/webvtt" }),
    ).toBe(true);
  });

  /* A `<track>` renders WebVTT and nothing else, so a SubRip body would add a
     caption menu entry that displays nothing when chosen. Indiana's Avalon
     publishes SubRip as `supplementing` transcripts, never as captions: in 400
     of their manifests every `/captions` body is `text/vtt`, while `text/srt`
     and `application/x-subrip` appear only under `/transcripts`. */
  it("rejects SubRip, which a track cannot render", () => {
    expect(
      isCaptionResource({ id: "https://example.org/c", format: "text/srt" }),
    ).toBe(false);
    expect(
      isCaptionResource({
        id: "https://example.org/c",
        format: "application/x-subrip",
      }),
    ).toBe(false);
    expect(isCaptionResource({ id: "https://example.org/c.srt" })).toBe(false);
  });

  /* `format` is a SHOULD, not a MUST. Captions served from an extensionless
     URL are common, so a body without a format is kept when it is
     dereferenceable — dropping a real caption is worse than keeping a dead
     menu entry. */
  it("accepts a dereferenceable resource that declares no format", () => {
    expect(
      isCaptionResource({
        id: "https://example.org/master_files/1/captions",
        type: "Text",
      }),
    ).toBe(true);
  });

  it("accepts an extension behind a query string or fragment", () => {
    expect(isCaptionResource({ id: "https://example.org/c.vtt?v=2" })).toBe(true);
    expect(isCaptionResource({ id: "https://example.org/c.VTT#t=0" })).toBe(true);
  });

  /* A real case: Wellcome Collection publishes a PDF transcript as a
     `supplementing` body on a video canvas. The browser was being asked to
     parse a PDF as WebVTT. */
  it("rejects a PDF transcript published as a supplementing body", () => {
    expect(
      isCaptionResource({
        id: "https://iiif.wellcomecollection.org/file/b16659090_0001.pdf",
        type: "Text",
        format: "application/pdf",
      }),
    ).toBe(false);
  });

  /* The browser rejects a track whose response is not text/vtt, so a body
     that declares text/plain is not usable even when its URL ends in .vtt. */
  it("rejects a declared non-caption format even with a caption extension", () => {
    expect(
      isCaptionResource({ id: "https://example.org/c.vtt", format: "text/plain" }),
    ).toBe(false);
  });

  it("rejects a relative id that declares no format", () => {
    expect(isCaptionResource({ id: "/local/thing" })).toBe(false);
  });

  /* A recognisable extension that is not a caption extension settles it, so
     the extensionless allowance above does not swallow every other file. */
  it("rejects a non-caption extension when no format is declared", () => {
    expect(isCaptionResource({ id: "https://example.org/notes.txt" })).toBe(false);
    expect(isCaptionResource({ id: "https://example.org/t.pdf" })).toBe(false);
  });

  /* Not handled here: Cookbook recipe 0074 wraps two WebVTT files in a
     `Choice`, which has no id of its own. It was never rendered before this
     change either — the Vault-minted id was unfetchable — so this is not a
     regression, but expanding `Choice.items` would make that recipe work. */
  it("rejects a Choice, which carries no id a track can fetch", () => {
    expect(isCaptionResource({ type: "Choice" })).toBe(false);
  });
});
