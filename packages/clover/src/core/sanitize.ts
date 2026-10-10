import DOMPurify from "dompurify";

/**
 * IIIF's limited HTML, and nothing else: the tags and attributes the Presentation API
 * allows in property values (`a`, `b`, `br`, `i`, `img`, `p`, `small`, `span`, `sub`,
 * `sup`), with `http(s):` and `mailto:` links only. Scripts, event handlers, `style`,
 * SVG, and `javascript:` or `data:` URLs are removed.
 *
 * DOMPurify is about 9 kB gzip, so this module is only ever imported dynamically (see
 * `ui/Markup.tsx`); `build/bundle.test.mjs` keeps it out of the initial chunk.
 *
 * @see https://iiif.io/api/presentation/3.0/#45-html-markup-in-property-values
 */

const CONFIG = {
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
};

let hooked = false;

export function sanitizeHTML(html: string): string {
  if (typeof window === "undefined") return html;
  if (!hooked) {
    hooked = true;
    // DOMPurify lets `data:` through on images by default; IIIF text has no use for it.
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      for (const name of ["src", "href"]) {
        const value = node.getAttribute?.(name);
        if (value && !CONFIG.ALLOWED_URI_REGEXP.test(value.trim())) {
          node.removeAttribute(name);
        }
      }
    });
  }
  return DOMPurify.sanitize(html, CONFIG);
}
