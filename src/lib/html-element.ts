import DOMPurify from "dompurify";

function createMarkup(html: string) {
  return { __html: sanitizeHTML(html) };
}

function sanitizeAttributes(props: any, remove: string[]) {
  const entries = Object.keys(props).filter((key) =>
    !remove.includes(key) ? key : null,
  );

  const attributes = new Object();
  entries.forEach((key) => {
    attributes[key] = props[key];
  });

  return attributes as React.HTMLAttributes<HTMLElement>;
}

function sanitizeHTML(html: string) {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "br",
      "i",
      "img",
      "p",
      "small",
      "span",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: ["href", "alt", "src", "height", "width"],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
  });
}

// Extends the base allowlist for markdown-rendered HTML: permits list
// structure (ul/ol/li), `id` attributes (needed for footnote anchor targets),
// and `#` fragment hrefs (needed for footnote forward/back navigation).
function sanitizeMarkdownHTML(html: string) {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "br",
      "hr",
      "i",
      "img",
      "li",
      "ol",
      "p",
      "small",
      "span",
      "sub",
      "sup",
      "ul",
    ],
    ALLOWED_ATTR: ["href", "alt", "src", "height", "width", "id"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#)/i,
  });
}

export { createMarkup, sanitizeAttributes, sanitizeHTML, sanitizeMarkdownHTML };
