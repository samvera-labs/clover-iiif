/**
 * IIIF HTML as plain text: tags dropped and the common entities decoded. What a value
 * shows before the sanitiser has loaded, and wherever markup cannot go (an `alt`, an
 * `aria-label`). Never used as HTML.
 */
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1] === "x" || entity[1] === "X"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return ENTITIES[entity.toLowerCase()] ?? match;
    });
}

/** Whether a value carries markup or entities, and so needs the sanitiser to show. */
export const hasMarkup = (value: string) =>
  /<[a-z!/]|&(#x?[0-9a-f]+|[a-z]+);/i.test(value);
