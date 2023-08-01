import sanitizeHtml from "sanitize-html";

function createMarkup(html: string) {
  return { __html: sanitizeHTML(html) };
}

function sanitizeAttributes(props: any, remove: string[]) {
  const entries = Object.keys(props).filter((key) =>
    !remove.includes(key) ? key : null
  );

  let attributes: any = new Object();
  entries.forEach((key) => {
    attributes[key] = props[key];
  });

  return attributes as React.HTMLAttributes<HTMLElement>;
}

function sanitizeHTML(html: string) {
  return sanitizeHtml(html, {
    allowedAttributes: {
      a: ["href"],
      img: ["alt", "src", "height", "width"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedTags: [
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
  });
}

export { createMarkup, sanitizeAttributes, sanitizeHTML };
