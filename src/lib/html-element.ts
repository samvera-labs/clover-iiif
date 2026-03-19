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

export { createMarkup, sanitizeAttributes, sanitizeHTML };
