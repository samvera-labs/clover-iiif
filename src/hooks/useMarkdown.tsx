import React, { useMemo } from "react";
import type { JSX } from "react";
import { Marked } from "marked";
import markedFootnote from "marked-footnote";
import { sanitizeMarkdownHTML } from "src/lib/html-element";

interface MarkdownResult {
  html: string;
  jsx: JSX.Element;
}

// Use a scoped Marked instance rather than `marked.setOptions(...)` so we
// don't mutate the global singleton. Consumers of this library may import
// `marked` themselves, and the global is shared across all installations
// that dedupe to the same module.
const markdownProcessor = new Marked({
  gfm: true,
  breaks: false,
  async: false,
});
markdownProcessor.use(markedFootnote({ footnoteDivider: true, description: "" }));

const convertMarkdown = (value: string) => {
  try {
    const raw = markdownProcessor.parse(value || "") as string;
    // marked-footnote places the footnote id on <li>, which DOMPurify strips.
    // Move the id to the inner <p> so the forward-link from the inline <sup>
    // still navigates to the correct target after sanitisation.
    const preprocessed = raw.replace(
      /<li id="([^"]+)">\n<p>/g,
      '<li><p id="$1">',
    );
    return sanitizeMarkdownHTML(preprocessed);
  } catch (error) {
    console.warn("Failed to convert markdown", error);
    return value || "";
  }
};

const useMarkdown = (value: string): MarkdownResult => {
  const html = useMemo(() => convertMarkdown(value), [value]);
  const jsx = useMemo(
    () => <div dangerouslySetInnerHTML={{ __html: html }} />,
    [html],
  );

  return { html, jsx };
};

export default useMarkdown;
