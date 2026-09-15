import fs from "node:fs";
import path from "node:path";

import { defaultColors } from "src/styles/tokens";

/**
 * Clover's custom properties are a contract with two halves, and both are load-bearing.
 *
 * 1. Every `var(--clover-*)` carries a literal fallback. That is what lets the library style
 *    itself correctly when a consumer declares nothing at all — which is the normal case.
 *    Exactly one property is declared anywhere in the library, so a reference that lost its
 *    fallback would silently resolve to nothing and drop the declaration.
 * 2. A colour's fallback is that token's documented default. If the hex in `tokens.ts` and the
 *    hex in the stylesheets drifted apart, `customTheme` and the docs table would disagree
 *    with what an unthemed component actually renders.
 */
const cssRoot = path.join(__dirname, "..");

const collect = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collect(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });

/** Every var() reference, with whatever follows the name up to the matching paren. */
const references = (css: string) => {
  const out: Array<{ name: string; rest: string }> = [];
  const re = /var\(\s*(--clover-[a-z0-9-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let i = m.index + m[0].length;
    let depth = 1;
    let rest = "";
    while (i < css.length && depth > 0) {
      const ch = css[i];
      if (ch === "(") depth += 1;
      else if (ch === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
      rest += ch;
      i += 1;
    }
    out.push({ name: m[1], rest });
  }
  return out;
};

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const files = collect(cssRoot);

describe("Clover custom properties", () => {
  it("finds the stylesheets", () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it("gives every var() reference a literal fallback", () => {
    const missing: string[] = [];
    for (const file of files) {
      for (const { name, rest } of references(
        stripComments(fs.readFileSync(file, "utf-8")),
      )) {
        if (!rest.trimStart().startsWith(",")) {
          missing.push(`${path.basename(file)}: var(${name})`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("uses each colour token's documented default as its fallback", () => {
    const kebab = (token: string) =>
      token.replace(/([A-Z])/g, "-$1").toLowerCase();
    const expected = new Map(
      Object.entries(defaultColors).map(([token, hex]) => [
        `--clover-color-${kebab(token)}`,
        hex.toLowerCase(),
      ]),
    );

    const wrong: string[] = [];
    for (const file of files) {
      for (const { name, rest } of references(
        stripComments(fs.readFileSync(file, "utf-8")),
      )) {
        const want = expected.get(name);
        if (!want) continue;
        const got = rest
          .replace(/^\s*,\s*/, "")
          .trim()
          .toLowerCase();
        if (got !== want) {
          wrong.push(
            `${path.basename(file)}: var(${name}, ${got}) — expected ${want}`,
          );
        }
      }
    }
    expect(wrong).toEqual([]);
  });
});

/**
 * The first half of the contract above says a `var()` reference always carries its literal
 * fallback, "because exactly one property is declared anywhere in the library". That sentence
 * was prose, and nothing held it to account.
 *
 * It matters more than it reads. A property declared on an element sets it *on* that element,
 * which outranks any value inherited from an ancestor — so declaring a token where it is used
 * silently ignores a consumer who themes it from a wrapper, which is the only way Clover
 * documents theming. The player's overlay palette was introduced that way and could not be
 * themed at all until the declarations came out.
 */
describe("Clover custom property declarations", () => {
  const declarations = (css: string) => {
    const out: string[] = [];
    const re = /(^|[;{])\s*(--clover-[a-z0-9-]+)\s*:/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(css))) out.push(m[2]);
    return out;
  };

  it("declares only the one property that is meant to be declared", () => {
    /*
     * `--clover-scroll-highlight` is deliberate: it is a shared channel triple, not a theming
     * token, and every use already carries the channels as a fallback. Anything else added
     * here should be a token nobody is expected to override.
     */
    const allowed = new Set(["--clover-scroll-highlight"]);

    const found = new Map<string, string[]>();
    for (const file of files) {
      for (const name of declarations(
        stripComments(fs.readFileSync(file, "utf-8")),
      )) {
        if (allowed.has(name)) continue;
        found.set(name, [...(found.get(name) ?? []), path.basename(file)]);
      }
    }

    expect(Object.fromEntries(found)).toEqual({});
  });
});
