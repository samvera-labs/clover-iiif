import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import useMarkdown from "./useMarkdown";
import {
  markdownAnnotationBody,
  markdownFootnotes,
  markdownGfm,
  markdownRawHtml,
} from "src/fixtures/markdown";

// The hook sanitises rendered HTML with the strict Clover allowlist
// (`src/lib/html-element.ts`): a, b, br, i, img, p, small, span, sub, sup.
// Tags outside that list are stripped — markdown structure (headings,
// lists, tables, blockquotes, strikethrough, code blocks) collapses to
// plain text inside paragraphs.

describe("useMarkdown", () => {
  it("renders inline emphasis through allowed tags", async () => {
    // **bold** and _italic_ → <strong>/<em> from marked, both stripped to
    // their text content by the allowlist (only b/i are kept). The
    // surrounding text is preserved.
    const { result } = renderHook(() => useMarkdown("**Hello** _world_"));
    await waitFor(() => {
      expect(result.current.html).toContain("Hello");
      expect(result.current.html).toContain("world");
    });
  });

  it("preserves links and link text", async () => {
    const { result } = renderHook(() => useMarkdown("[IIIF](https://iiif.io)"));
    await waitFor(() => {
      expect(result.current.html).toContain(
        '<a href="https://iiif.io">IIIF</a>',
      );
    });
  });

  it("strips disallowed protocols on links", async () => {
    const { result } = renderHook(() =>
      useMarkdown("[bad](javascript:alert(1))"),
    );
    await waitFor(() => {
      expect(result.current.html).not.toContain("javascript:");
    });
  });

  it("strips heading tags but preserves list structure and text", async () => {
    const { result } = renderHook(() => useMarkdown("# Title\n\n- one\n- two"));
    await waitFor(() => {
      expect(result.current.html).not.toContain("<h1");
      expect(result.current.html).toContain("<ul");
      expect(result.current.html).toContain("<li");
      expect(result.current.html).toContain("Title");
      expect(result.current.html).toContain("one");
      expect(result.current.html).toContain("two");
    });
  });

  it("preserves <p> wrappers from paragraphs", async () => {
    const { result } = renderHook(() =>
      useMarkdown("Paragraph one.\n\nParagraph two."),
    );
    await waitFor(() => {
      expect(result.current.html).toContain("<p>");
      expect(result.current.html).toContain("Paragraph one.");
    });
  });

  it("returns the input string when given an empty value", () => {
    const { result } = renderHook(() => useMarkdown(""));
    expect(result.current.html).toBe("");
  });

  it("provides a JSX element with the rendered html", () => {
    const { result } = renderHook(() => useMarkdown("**bold**"));
    expect(result.current.jsx).toBeDefined();
    expect(result.current.jsx.type).toBe("div");
  });

  describe("security: sanitisation", () => {
    it("strips <script> blocks", async () => {
      const { result } = renderHook(() =>
        useMarkdown(`Hello <script>alert('xss')</script> there.`),
      );
      await waitFor(() => {
        expect(result.current.html).not.toContain("<script");
        expect(result.current.html).not.toContain("alert");
        expect(result.current.html).toContain("Hello");
        expect(result.current.html).toContain("there.");
      });
    });

    it("strips event-handler attributes", async () => {
      const md = `<a href="https://example.org" onclick="alert('xss')">click</a>`;
      const { result } = renderHook(() => useMarkdown(md));
      await waitFor(() => {
        expect(result.current.html).not.toContain("onclick");
        expect(result.current.html).toContain(
          '<a href="https://example.org">click</a>',
        );
      });
    });

    it("strips <iframe> embeds", async () => {
      const { result } = renderHook(() =>
        useMarkdown(
          `Before <iframe src="https://evil.example.org"></iframe> after`,
        ),
      );
      await waitFor(() => {
        expect(result.current.html).not.toContain("<iframe");
        expect(result.current.html).not.toContain("evil.example.org");
      });
    });

    it("strips javascript: URIs in <img> src", async () => {
      const { result } = renderHook(() =>
        useMarkdown(`<img src="javascript:alert(1)" alt="x">`),
      );
      await waitFor(() => {
        expect(result.current.html).not.toContain("javascript:");
      });
    });
  });

  describe("malformed HTML normalisation", () => {
    it("auto-closes an unterminated <span> tag", async () => {
      const { result } = renderHook(() =>
        useMarkdown(`Before <span class="x">middle and after`),
      );
      await waitFor(() => {
        // DOMPurify reparses through an HTML parser so unclosed tags get
        // closed and don't leak into surrounding DOM.
        const matches = result.current.html.match(/<\/span>/g) || [];
        expect(matches.length).toBeGreaterThanOrEqual(1);
        expect(result.current.html).toContain("middle and after");
      });
    });

    it("handles overlapping tags without leaking structure", async () => {
      const { result } = renderHook(() =>
        useMarkdown(`<b>bold <i>both</b> italic</i>`),
      );
      await waitFor(() => {
        // Whatever DOMPurify produces, both text fragments survive and
        // every opening tag has a matching close.
        expect(result.current.html).toContain("bold");
        expect(result.current.html).toContain("both");
        expect(result.current.html).toContain("italic");
        const opens = (result.current.html.match(/<(b|i)\b/g) || []).length;
        const closes = (result.current.html.match(/<\/(b|i)>/g) || []).length;
        expect(closes).toBe(opens);
      });
    });
  });

  describe("list rendering", () => {
    it("renders unordered list items as <ul>/<li>", async () => {
      const { result } = renderHook(() =>
        useMarkdown("- alpha\n- beta\n- gamma"),
      );
      await waitFor(() => {
        expect(result.current.html).toContain("<ul>");
        expect(result.current.html).toContain("<li>");
        expect(result.current.html).toContain("alpha");
        expect(result.current.html).toContain("beta");
      });
    });

    it("renders ordered list items as <ol>/<li>", async () => {
      const { result } = renderHook(() =>
        useMarkdown("1. first\n2. second\n3. third"),
      );
      await waitFor(() => {
        expect(result.current.html).toContain("<ol>");
        expect(result.current.html).toContain("<li>");
        expect(result.current.html).toContain("first");
        expect(result.current.html).toContain("second");
      });
    });

    it("preserves nested list structure", async () => {
      const md =
        "- verse line one\n\n  - continuation of line one\n\n- verse line two\n\n  - continuation of line two";
      const { result } = renderHook(() => useMarkdown(md));
      await waitFor(() => {
        // Outer and inner <ul> both survive sanitisation.
        const uls = (result.current.html.match(/<ul>/g) || []).length;
        expect(uls).toBeGreaterThanOrEqual(2);
        expect(result.current.html).toContain("verse line one");
        expect(result.current.html).toContain("continuation of line one");
      });
    });
  });

  describe("GFM footnotes", () => {
    // marked does not parse footnotes natively; the marked-footnote extension
    // is required. Without it, [^1] renders as literal text.

    it("renders footnote reference as <sup>, not literal [^n] text", async () => {
      const { result } = renderHook(() =>
        useMarkdown("Annotation text.[^1]\n\n[^1]: Source note."),
      );
      await waitFor(() => {
        expect(result.current.html).not.toContain("[^1]");
        expect(result.current.html).toContain("<sup>");
      });
    });

    it("renders the footnote definition text in the output", async () => {
      const { result } = renderHook(() =>
        useMarkdown("Annotation text.[^1]\n\n[^1]: The footnote body."),
      );
      await waitFor(() => {
        expect(result.current.html).toContain("The footnote body.");
      });
    });

    it("renders an <hr> before the footnote list, with no label text", async () => {
      // footnoteDivider:true adds <hr>; description:"" empties the <h2> so no
      // "Footnotes" heading text leaks out when the tag is stripped.
      const { result } = renderHook(() =>
        useMarkdown("Text.[^1]\n\n[^1]: Footnote body."),
      );
      await waitFor(() => {
        expect(result.current.html).toContain("<hr");
        expect(result.current.html).not.toContain("Footnotes");
        expect(result.current.html).not.toContain("<section");
        expect(result.current.html).toContain("<ol>");
        expect(result.current.html).toContain("<li>");
        expect(result.current.html).toContain("Footnote body.");
      });
    });

    it("preserves fragment hrefs on footnote forward and back links", async () => {
      // The markdown sanitiser extends the URI allowlist to include '#' so
      // footnote navigation links survive DOMPurify.
      const { result } = renderHook(() =>
        useMarkdown("Text.[^1]\n\n[^1]: Note."),
      );
      await waitFor(() => {
        // Inline ref: <sup><a href="#footnote-1" id="footnote-ref-1">1</a></sup>
        expect(result.current.html).toContain('href="#footnote-1"');
        // Back-reference: <a href="#footnote-ref-1">↩</a>
        expect(result.current.html).toContain('href="#footnote-ref-1"');
      });
    });

    it("preserves ids so both ends of each footnote link resolve", async () => {
      // The inline <a id="footnote-ref-1"> is the back-link target.
      // The <p id="footnote-1"> (id moved from the stripped <li>) is the
      // forward-link target.
      const { result } = renderHook(() =>
        useMarkdown("Text.[^1]\n\n[^1]: Note."),
      );
      await waitFor(() => {
        expect(result.current.html).toContain('id="footnote-ref-1"');
        expect(result.current.html).toContain('id="footnote-1"');
      });
    });

    it("renders multiple footnote references in document order", async () => {
      const { result } = renderHook(() =>
        useMarkdown(
          "First claim.[^1] Second claim.[^2]\n\n[^1]: Note A.\n[^2]: Note B.",
        ),
      );
      await waitFor(() => {
        expect(result.current.html).toContain("Note A.");
        expect(result.current.html).toContain("Note B.");
        const first = result.current.html.indexOf("<sup>");
        const second = result.current.html.indexOf("<sup>", first + 1);
        expect(second).toBeGreaterThan(first);
      });
    });

    it("renders realistic multi-footnote IIIF annotation fixture", async () => {
      const { result } = renderHook(() => useMarkdown(markdownFootnotes));
      await waitFor(() => {
        expect(result.current.html).not.toContain("[^1]");
        expect(result.current.html).not.toContain("[^2]");
        expect(result.current.html).toContain("<sup>");
        expect(result.current.html).toContain("Jones");
        expect(result.current.html).toContain("volume II");
      });
    });
  });

  describe("realistic IIIF annotation fixtures", () => {
    it("strips GFM tables and strikethrough but keeps text content", async () => {
      const { result } = renderHook(() => useMarkdown(markdownGfm));
      await waitFor(() => {
        expect(result.current.html).not.toContain("<table");
        expect(result.current.html).not.toContain("<del");
        expect(result.current.html).toContain("complete");
        expect(result.current.html).toContain("partial");
      });
    });

    it("renders a mixed Markdown + raw HTML fixture with allowed inline tags", async () => {
      const { result } = renderHook(() => useMarkdown(markdownRawHtml));
      await waitFor(() => {
        expect(result.current.html).toContain(
          '<a href="https://example.org/source">an external',
        );
        expect(result.current.html).toContain("page 14");
      });
    });

    it("renders a transcription-style fixture preserving links and text", async () => {
      const { result } = renderHook(() => useMarkdown(markdownAnnotationBody));
      await waitFor(() => {
        // <h2> and <blockquote> are stripped under the strict allowlist.
        expect(result.current.html).not.toContain("<h2");
        expect(result.current.html).not.toContain("<blockquote");
        expect(result.current.html).toContain("Transcription");
        expect(result.current.html).toContain(
          '<a href="https://example.org/notes">more</a>',
        );
      });
    });
  });
});
