import { markdownToHtml } from "./markdown";
import { sanitizeHTML } from "./sanitize";

describe("markdownToHtml", () => {
  it("writes paragraphs, emphasis, links and breaks", () => {
    expect(
      markdownToHtml(
        "*Translated* by **A. B.**  \nsee [the page](https://example.org/a_b_c).\n\nNext.",
      ),
    ).toBe(
      '<p><i>Translated</i> by <b>A. B.</b><br>see <a href="https://example.org/a_b_c">the page</a>.</p><p>Next.</p>',
    );
  });

  it("numbers footnotes and lists them at the end", () => {
    expect(markdownToHtml("Text[^1].\n\n[^1]: The note.")).toBe(
      "<p>Text<sup>1</sup>.</p><p><small><sup>1</sup> The note.</small></p>",
    );
  });

  it("escapes HTML in the source, and leaves unsafe links as text", () => {
    const html = sanitizeHTML(
      markdownToHtml(
        "<script>alert(1)</script> [x](javascript:alert(1)) <img src=x onerror=1>",
      ),
    );
    expect(html).not.toMatch(/<script|<img|href=/);
    expect(html).toContain("&lt;script&gt;");
  });
});
