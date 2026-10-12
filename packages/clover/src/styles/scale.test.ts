import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

/*
 * The scale is the only source of space and type size (DESIGN.md). Every stylesheet in the
 * package is read: a spacing, inset or font-size declaration may use the scale's custom
 * properties (`--clover-space-*`, `--clover-text-*`, `--clover-control`), `0`, percentages,
 * keywords and hairlines (at most 4px), never a literal rem or em. A font size is one of
 * the four text steps or `inherit`, nothing in between. No font family is ever set: type
 * is the page's.
 */
const SRC = resolve(__dirname, "..");
const SCALE = resolve(__dirname, "scale.css");

function stylesheets(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return stylesheets(path);
    return name.endsWith(".css") ? [path] : [];
  });
}

const SPACING =
  /^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left|font-size)(-[a-z-]+)?$/;

function declarations(css: string) {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...plain.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)].map(
    ([, property, value]) => ({ property, value: value.trim() }),
  );
}

describe("the scale", () => {
  const files = stylesheets(SRC).filter((file) => file !== SCALE);

  it("is the only source of space and type size", () => {
    const off: string[] = [];
    for (const file of files) {
      for (const { property, value } of declarations(
        readFileSync(file, "utf8"),
      )) {
        if (!SPACING.test(property)) continue;
        const literal = value.match(/(?<![\w-])-?\d*\.?\d+(rem|em)\b/);
        const wide = [...value.matchAll(/(?<![\w-])-?(\d*\.?\d+)px\b/g)].find(
          ([, n]) => Math.abs(Number(n)) > 4,
        );
        if (literal || wide)
          off.push(`${relative(SRC, file)}: ${property}: ${value}`);
      }
    }
    expect(off).toEqual([]);
  });

  it("sizes text only on the type scale: four steps and the page's own size", () => {
    const steps = [
      ...readFileSync(SCALE, "utf8").matchAll(/(--clover-text-[a-z0-9]+)\s*:/g),
    ].map(([, name]) => name);
    expect(steps).toEqual([
      "--clover-text-xs",
      "--clover-text-s",
      "--clover-text-m",
      "--clover-text-l",
    ]);
    const allowed = new Set([
      "inherit",
      ...steps.map((name) => `var(${name})`),
    ]);
    const off: string[] = [];
    for (const file of files) {
      for (const { property, value } of declarations(
        readFileSync(file, "utf8"),
      )) {
        if (property === "font-size" && !allowed.has(value))
          off.push(`${relative(SRC, file)}: ${property}: ${value}`);
      }
    }
    expect(off).toEqual([]);
  });

  it("never sets a font family: type is the page's", () => {
    const set: string[] = [];
    for (const file of [...files, SCALE]) {
      for (const { property, value } of declarations(
        readFileSync(file, "utf8"),
      )) {
        if (
          property === "font-family" ||
          (property === "font" && value !== "inherit")
        )
          set.push(`${relative(SRC, file)}: ${property}: ${value}`);
      }
    }
    expect(set).toEqual([]);
  });
});
