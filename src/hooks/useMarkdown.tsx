import React, { useMemo } from "react";
import type { JSX } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

interface MarkdownResult {
  html: string;
  jsx: JSX.Element;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

const convertMarkdown = (value: string) => {
  try {
    const file = processor.processSync(value || "");
    return String(file);
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
