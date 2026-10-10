import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

/*
 * 3.x (`src/`) and 4.x (`packages/clover/src/`) style their parts with `clover-*` classes,
 * and both stylesheets can load on one page — the docs do it, and so may an app moving to
 * 4.x a part at a time. A class used by both would let one package's rules restyle the
 * other's markup, so no class may be shared.
 */
const root = resolve(import.meta.dirname, "..");

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "fixtures" ? [] : files(path);
    return /\.(css|tsx?)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

function classes(dir) {
  const found = new Set();
  for (const file of files(dir)) {
    const text = readFileSync(file, "utf8");
    const pattern = file.endsWith(".css")
      ? /\.(clover-[a-z0-9-]+)/g
      : /["'`\s](clover-[a-z0-9-]+)(?=["'`\s])/g;
    for (const [, name] of text.matchAll(pattern)) found.add(name);
  }
  return found;
}

/*
 * Names both use on purpose that are not classes: custom element tags. 4.x's
 * `<clover-viewer>` takes 3.x's tag so it can replace it on a page as it is; a tag never
 * matches 3.x's `.clover-viewer` class selector. Nothing else belongs here.
 */
const TAGS = new Set(["clover-viewer"]);

test("3.x and @nulib/clover share no class names", () => {
  const v3 = classes(resolve(root, "src"));
  const v4 = classes(resolve(root, "packages/clover/src"));
  const shared = [...v4]
    .filter((name) => v3.has(name) && !TAGS.has(name))
    .sort();
  assert.deepEqual(shared, [], `shared classes: ${shared.join(", ")}`);
});
