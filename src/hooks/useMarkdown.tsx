import React, { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { sanitizeMarkdownHTML } from "src/lib/html-element";

interface MarkdownResult {
  html: string;
  jsx: JSX.Element;
}

// Lazily import marked + marked-footnote the first time any markdown annotation
// is encountered. The promise is cached at module scope so the dynamic import
// fires only once regardless of how many hook instances are active.
let converterPromise: Promise<(value: string) => string> | null = null;

function getConverter(): Promise<(value: string) => string> {
  if (!converterPromise) {
    converterPromise = Promise.all([
      import("marked"),
      import("marked-footnote"),
    ]).then(([{ Marked }, { default: markedFootnote }]) => {
      // Use a scoped Marked instance so we don't mutate the global singleton.
      const processor = new Marked({ gfm: true, breaks: false, async: false });
      processor.use(markedFootnote({ footnoteDivider: true, description: "" }));

      return (value: string): string => {
        try {
          const raw = processor.parse(value || "") as string;
          // marked-footnote places the footnote id on <li>, which DOMPurify
          // strips. Move it to the inner <p> so the forward-link from the
          // inline <sup> still navigates to the correct target.
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
    });
  }
  return converterPromise;
}

const useMarkdown = (value: string): MarkdownResult => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!value) {
      setHtml("");
      return;
    }
    let cancelled = false;
    getConverter().then((convert) => {
      if (!cancelled) setHtml(convert(value));
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const jsx = useMemo(
    () => <div dangerouslySetInnerHTML={{ __html: html }} />,
    [html],
  );

  return { html, jsx };
};

export default useMarkdown;
