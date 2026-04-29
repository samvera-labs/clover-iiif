import React, { useMemo } from "react";
import type { JSX } from "react";
import { Marked } from "marked";
import { sanitizeHTML } from "src/lib/html-element";

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

const convertMarkdown = (value: string) => {
  try {
    // Sanitise the rendered HTML through the same strict allowlist used
    // for Primitives elsewhere in Clover. This removes anything dangerous
    // and also normalises malformed / unclosed raw HTML — replicating the
    // structural normalisation the previous remark/rehype pipeline got
    // from `rehype-raw`.
    const raw = markdownProcessor.parse(value || "") as string;
    return sanitizeHTML(raw);
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
