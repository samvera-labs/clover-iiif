/**
 * The Markdown IIIF bodies use (`format: "text/markdown"`), as HTML: paragraphs, line
 * breaks, `*emphasis*`, `**strong**`, `[links](https://…)`, bullet and numbered lists,
 * headings (as bold paragraphs), and footnotes (`[^1]` and `[^1]: …`). Not a full
 * CommonMark parser — enough for annotation text, and small.
 *
 * The output is always passed through `sanitizeHTML` before it is shown; nothing here is
 * trusted. Text is escaped first, so only the markup this module writes survives.
 */

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Inline markup within one block. */
function inline(text: string, notes: Map<string, number>): string {
  // Links are set aside first, so emphasis never reaches into a URL (`a_b_c`).
  const links: string[] = [];
  const marked = escape(text)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
      (_, label: string, url: string) => {
        links.push(url);
        return `\u0000${links.length - 1}\u0001${label}\u0002`;
      },
    )
    // Footnote references, numbered in order of first definition.
    .replace(/\[\^([^\]]+)\]/g, (match, key: string) => {
      const number = notes.get(key);
      return number ? `<sup>${number}</sup>` : match;
    })
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_, a, b) => `<b>${a ?? b}</b>`)
    .replace(
      /\*([^*\s][^*]*)\*|_([^_\s][^_]*)_/g,
      (_, a, b) => `<i>${a ?? b}</i>`,
    )
    // A hard line break: two trailing spaces or a backslash, then a newline.
    .replace(/( {2,}|\\)\n/g, "<br>")
    .replace(/\n/g, " ");
  return marked.replace(
    /\u0000(\d+)\u0001([^\u0002]*)\u0002/g,
    (_, index: string, label: string) =>
      `<a href="${links[Number(index)]}">${label}</a>`,
  );
}

export function markdownToHtml(markdown: string): string {
  const notes = new Map<string, number>();
  const definitions: Array<[string, string]> = [];
  const body = markdown
    .replace(/\r\n?/g, "\n")
    .replace(/^\[\^([^\]]+)\]:\s*(.*)$/gm, (_, key: string, text: string) => {
      notes.set(key, notes.size + 1);
      definitions.push([key, text]);
      return "";
    });

  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const html = blocks.map((block) => {
    const lines = block.split("\n");
    if (lines.every((line) => /^\s*[-*+]\s+/.test(line))) {
      return `<p>${lines
        .map((line) => `• ${inline(line.replace(/^\s*[-*+]\s+/, ""), notes)}`)
        .join("<br>")}</p>`;
    }
    if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) {
      return `<p>${lines.map((line) => inline(line.trim(), notes)).join("<br>")}</p>`;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(block);
    if (heading) return `<p><b>${inline(heading[1], notes)}</b></p>`;
    return `<p>${inline(block, notes)}</p>`;
  });

  if (definitions.length) {
    html.push(
      `<p><small>${definitions
        .map(
          ([key, text]) =>
            `<sup>${notes.get(key)}</sup> ${inline(text, notes)}`,
        )
        .join("<br>")}</small></p>`,
    );
  }
  return html.join("");
}
