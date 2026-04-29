import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import useMarkdown from "./useMarkdown";
import {
  markdownAnnotationBody,
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

  it("strips block-level structural tags (headings, lists, tables) leaving text", async () => {
    const { result } = renderHook(() => useMarkdown("# Title\n\n- one\n- two"));
    await waitFor(() => {
      expect(result.current.html).not.toContain("<h1");
      expect(result.current.html).not.toContain("<ul");
      expect(result.current.html).not.toContain("<li");
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
