import fs from "node:fs";
import path from "node:path";

import { media } from "src/styles/media";

/**
 * The breakpoints exist twice: once here for `useMediaQuery`, and once in every `@media`
 * query across Clover's stylesheets, which cannot read a TypeScript value.
 *
 * That duplication is unavoidable, but a silent divergence is not: if `media.sm` moved and
 * the stylesheets did not follow, the Viewer would switch behaviour at one width and
 * switch layout at another. This asserts every width in Clover's CSS is a width this map
 * declares.
 */
const cssRoot = path.join(__dirname, "..");

const collectCss = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectCss(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });

describe("breakpoints", () => {
  const declared = new Set(
    Object.values(media).flatMap((query) =>
      Array.from(query.matchAll(/\((?:max|min)-width:\s*([^)]+)\)/g)).map((m) =>
        m[1].trim(),
      ),
    ),
  );

  it("declares a width for every breakpoint used in Clover's CSS", () => {
    const files = collectCss(cssRoot);
    expect(files.length).toBeGreaterThan(0);

    const used = new Map<string, string[]>();
    for (const file of files) {
      const css = fs.readFileSync(file, "utf-8");
      for (const m of css.matchAll(
        /@media[^{]*\((?:max|min)-width:\s*([^)]+)\)/g,
      )) {
        const width = m[1].trim();
        used.set(width, [...(used.get(width) ?? []), path.basename(file)]);
      }
    }

    const orphans = [...used.entries()]
      .filter(([width]) => !declared.has(width))
      .map(([width, files]) => `${width} (${[...new Set(files)].join(", ")})`);

    expect(orphans).toEqual([]);
  });

  /* The map is the source; a breakpoint no CSS uses is fine, an undeclared one is not. */
  it("keeps the JS breakpoints as plain media query strings", () => {
    Object.values(media).forEach((query) => {
      expect(query).toMatch(/^\((?:max|min)-width: .+\)$/);
    });
  });
});
