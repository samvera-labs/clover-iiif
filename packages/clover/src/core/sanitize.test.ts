import { sanitizeHTML } from "./sanitize";

/**
 * Manifests are other people's data. Everything Clover renders as HTML goes through
 * `sanitizeHTML`, so these are the payloads it must defuse.
 */
describe("sanitizeHTML", () => {
  const cases: Array<[string, string, (out: string) => void]> = [
    [
      "a script",
      "<p>Hi<script>alert(1)</script></p>",
      (out) => expect(out).toBe("<p>Hi</p>"),
    ],
    [
      "an event handler",
      '<img src="https://example.org/a.jpg" onerror="alert(1)">',
      (out) => expect(out).toBe('<img src="https://example.org/a.jpg">'),
    ],
    [
      "a javascript: link",
      '<a href="javascript:alert(1)">x</a>',
      (out) => expect(out).toBe("<a>x</a>"),
    ],
    [
      "a javascript: link with whitespace and case",
      '<a href=" JaVaScRiPt:alert(1)">x</a>',
      (out) => expect(out).not.toMatch(/javascript/i),
    ],
    [
      "a data: link",
      '<a href="data:text/html,<script>alert(1)</script>">x</a>',
      (out) => expect(out).toBe("<a>x</a>"),
    ],
    [
      "a data: image",
      '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
      (out) => expect(out).toBe("<img>"),
    ],
    [
      "inline SVG with a script",
      '<svg onload="alert(1)"><script>alert(1)</script></svg>ok',
      (out) => expect(out).toBe("ok"),
    ],
    [
      "an iframe",
      '<iframe src="https://evil.example"></iframe>ok',
      (out) => expect(out).toBe("ok"),
    ],
    [
      "a style attribute",
      '<span style="background:url(javascript:alert(1))">x</span>',
      (out) => expect(out).toBe("<span>x</span>"),
    ],
  ];

  it.each(cases)("removes %s", (_, input, check) => check(sanitizeHTML(input)));

  it("keeps IIIF's allowed markup", () => {
    const html =
      '<p><b>Bold</b>, <i>italic</i>, <a href="https://example.org">a link</a>,<br><small>small</small> <sub>1</sub><sup>2</sup> <span>span</span> <a href="mailto:a@example.org">mail</a></p>';
    expect(sanitizeHTML(html)).toBe(html);
  });
});
