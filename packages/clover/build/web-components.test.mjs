/**
 * `<clover-viewer>` as built (`npm run build:web-components`): Preact, not React; MapLibre
 * and hls.js only on demand; MapLibre's worker found from any path; and what a page loads
 * up front, against its budget.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "dist/web-components");
const budget = JSON.parse(
  readFileSync(join(root, "build/size-budget.json"), "utf8"),
);

const read = (file) => readFileSync(join(dir, file), "utf8");
const staticImports = (source) =>
  [
    ...source.matchAll(
      /(?:^|[;}\s])import\s*(?:[^"'()]*?from\s*)?["']\.\/([^"']+)["']/g,
    ),
  ].map((match) => match[1]);

/** The entry and every chunk it imports statically: what loads before anything shows. */
function upFront() {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file) || !existsSync(join(dir, file))) return;
    seen.add(file);
    staticImports(read(file)).forEach(visit);
  };
  visit("index.mjs");
  return seen;
}

test("the element is built, with a classic-script loader beside it", () => {
  assert.ok(existsSync(join(dir, "index.mjs")), "run npm run build first");
  assert.ok(existsSync(join(dir, "index.umd.js")));
});

test("Preact draws it, not React", () => {
  const source = [...upFront()].map(read).join("\n");
  assert.ok(!/react-dom\.production|scheduler\.production/.test(source));
  assert.ok(
    /\.__H\b|\.__k\b/.test(source),
    "Preact's internals should be there",
  );
});

test("MapLibre and hls.js load only on demand; the worker is found from any path", () => {
  const files = readdirSync(dir).filter((file) => file.endsWith(".mjs"));
  const front = upFront();
  for (const name of ["maplibre-gl", "hls"]) {
    const chunk = files.find((file) => file.startsWith(`${name}-`));
    assert.ok(chunk, `${name} must be emitted`);
    assert.ok(!front.has(chunk), `${name} must stay deferred`);
  }
  const source = [...front].map(read).join("\n");
  assert.ok(
    /new URL\("assets\/maplibre-gl-worker-[^"]+", import\.meta\.url\)/.test(
      source,
    ),
    "MapLibre's worker must resolve against the module, not the site root",
  );
  assert.ok(!/["']\/assets\//.test(source));
});

test("what a page loads up front stays within budget", (t) => {
  const size = [...upFront()].reduce(
    (sum, file) =>
      sum + gzipSync(readFileSync(join(dir, file)), { level: 9 }).length,
    0,
  );
  t.diagnostic(
    `<clover-viewer> up front ${(size / 1000).toFixed(1)} kB gzip (budget ${(budget.webComponentsGzip / 1000).toFixed(1)} kB)`,
  );
  assert.ok(size <= budget.webComponentsGzip, `${size} B gzip, over budget`);
});
