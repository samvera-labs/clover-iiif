/*
 * What @nulib/clover's build emits, and what a consumer ships from it.
 *
 * The graph checks build in memory. The size table bundles the built `dist/` the way a
 * consumer's bundler would, so run `npm run build -w @nulib/clover` first.
 */
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build as esbuild } from "esbuild";
import { build } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const budget = JSON.parse(
  readFileSync(resolve(root, "build/size-budget.json"), "utf8"),
);

/** Packages 4.x has left behind. None may appear in the build, bundled or imported. */
const FORBIDDEN = [
  /^openseadragon/,
  /^@vidstack\//,
  /^wavesurfer\.js/,
  /^@radix-ui\//,
  /^embla-carousel/,
  /^react-error-boundary/,
  /^uuid/,
  /^react-lazy-load-image-component/,
  /^node-webvtt/,
  /^flexsearch/,
  /^marked/,
  /^@samvera\/clover-iiif/,
  // 422 kB gzip for one warped layer: Clover draws basic georeferences itself.
  /^@allmaps\//,
];

/** Modules that must load only on demand: reachable by dynamic import, never statically. */
const LAZY_MODULES = [
  "/components/Canvas/media/MediaStage.tsx",
  "/components/Canvas/CaptionDetails.tsx",
  "/core/sanitize.ts",
  "/core/svg-shape.ts",
  "/components/Canvas/FrameAnimation.tsx",
];
/** Packages imported only on demand: media streaming, sanitising, upgrading old IIIF. */
const LAZY_PACKAGES = ["hls.js", "dompurify", "@iiif/parser", "maplibre-gl"];

const packageName = (id) =>
  id.startsWith("@") ? id.split("/").slice(0, 2).join("/") : id.split("/")[0];

async function emitted() {
  const result = await build({
    configFile: resolve(root, "vite.config.mjs"),
    logLevel: "silent",
    build: { write: false },
  });
  const output = [result].flat()[0].output;
  return new Map(
    output
      .filter((file) => file.type === "chunk")
      .map((chunk) => [chunk.fileName, chunk]),
  );
}

/** Every chunk reached from `start` by static imports (and dynamic ones when asked). */
function closure(chunks, start, dynamic = false) {
  const seen = new Set();
  const visit = (fileName) => {
    if (seen.has(fileName) || !chunks.has(fileName)) return;
    seen.add(fileName);
    const chunk = chunks.get(fileName);
    chunk.imports.forEach(visit);
    if (dynamic) chunk.dynamicImports.forEach(visit);
  };
  visit(start);
  return seen;
}

test("three entries, only package source, externals within dependencies and peers", async () => {
  const chunks = await emitted();
  const entries = [...chunks.values()].filter((chunk) => chunk.isEntry);
  assert.deepEqual(entries.map((chunk) => chunk.fileName).sort(), [
    "index.mjs",
    "map/index.mjs",
    "templates/index.mjs",
  ]);

  const allowed = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]);
  for (const chunk of chunks.values()) {
    for (const id of Object.keys(chunk.modules)) {
      assert.ok(
        id.startsWith(resolve(root, "src") + "/") || id.startsWith("\0"),
        `${chunk.fileName} bundles ${id}, which is not package source`,
      );
    }
    for (const id of [...chunk.imports, ...chunk.dynamicImports]) {
      if (chunks.has(id)) continue;
      assert.ok(
        allowed.has(packageName(id)),
        `${chunk.fileName} imports ${id}, which is not a dependency or peer`,
      );
      for (const pattern of FORBIDDEN) {
        assert.ok(!pattern.test(id), `${chunk.fileName} imports ${id}`);
      }
    }
  }
});

test("media, caption details, the sanitiser, hls.js and the upgrader load only on demand", async () => {
  const chunks = await emitted();
  const initial = closure(chunks, "index.mjs");
  const reachable = closure(chunks, "index.mjs", true);

  for (const suffix of LAZY_MODULES) {
    const chunk = [...chunks.values()].find((c) =>
      Object.keys(c.modules).some((id) => id.endsWith(suffix)),
    );
    assert.ok(chunk, `${suffix} must be emitted`);
    assert.ok(!initial.has(chunk.fileName), `${suffix} must stay deferred`);
    assert.ok(reachable.has(chunk.fileName), `${suffix} must be reachable`);
  }
  for (const fileName of initial) {
    for (const id of chunks.get(fileName).imports) {
      assert.ok(
        !LAZY_PACKAGES.includes(packageName(id)),
        `${fileName} imports ${id} statically`,
      );
    }
  }
});

test("MapLibre loads only on demand; the parts reach the map only lazily", async () => {
  const chunks = await emitted();
  for (const entry of ["index.mjs", "templates/index.mjs", "map/index.mjs"]) {
    const initial = closure(chunks, entry);
    for (const fileName of initial) {
      for (const id of chunks.get(fileName).imports) {
        assert.ok(
          packageName(id) !== "maplibre-gl",
          `${fileName} (from ${entry}) imports ${id} statically`,
        );
      }
      if (entry === "map/index.mjs") continue;
      // The Viewer's Map tab is a lazy chunk: nothing of the map loads up front.
      const modules = Object.keys(chunks.get(fileName).modules);
      assert.ok(
        !modules.some((id) => /\/components\/Map\/|\/core\/geo\.ts$/.test(id)),
        `${fileName} (from ${entry}) carries the map statically`,
      );
    }
  }
  const reachable = closure(chunks, "index.mjs", true);
  assert.ok(
    [...reachable].some((fileName) =>
      Object.keys(chunks.get(fileName).modules).some((id) =>
        id.endsWith("/components/Map/MapView.tsx"),
      ),
    ),
    "the Map tab must be reachable from the parts, lazily",
  );
});

/**
 * What a consumer's bundler ships up front for some named exports: the entry and every
 * chunk it imports statically, gzipped. Lazy chunks are left out.
 */
async function initialGzip(
  exports,
  out,
  entry = "index.mjs",
  { onDemand = null } = {},
) {
  const result = await esbuild({
    stdin: {
      contents: `export { ${exports} } from ${JSON.stringify(resolve(dist, entry))};`,
      resolveDir: root,
      sourcefile: "entry.mjs",
    },
    bundle: true,
    minify: true,
    format: "esm",
    splitting: true,
    outdir: out,
    entryNames: "entry",
    external: ["react", "react-dom", "react/jsx-runtime"],
    metafile: true,
    // Metafile paths are relative to this.
    absWorkingDir: root,
    write: true,
    logLevel: "silent",
  });
  const outputs = result.metafile.outputs;
  const initial = new Set();
  const visit = (file) => {
    if (initial.has(file) || !outputs[file]) return;
    initial.add(file);
    for (const { path, kind } of outputs[file].imports) {
      if (kind === "import-statement") visit(path);
    }
  };
  // The consumer's own entry (stdin, reported by its `sourcefile`). esbuild marks every
  // lazy chunk an entry point too, so "the first output with an entryPoint" is not it.
  const entryFile = Object.keys(outputs).find(
    (file) => outputs[file].entryPoint === "entry.mjs",
  );
  assert.ok(
    entryFile,
    `esbuild emitted no output for the entry: ${JSON.stringify(
      Object.fromEntries(
        Object.entries(outputs)
          .filter(([, output]) => output.entryPoint)
          .map(([file, output]) => [file, output.entryPoint]),
      ),
    )}`,
  );
  visit(entryFile);
  if (!onDemand) {
    return [...initial].reduce(
      (sum, file) => sum + gzip(resolve(root, file)),
      0,
    );
  }
  // What loads later for `onDemand`: the chunks reached from lazy entries matching it
  // (MapLibre's), not everything lazy (the upgrader loads with any content).
  const later = new Set();
  const reach = (file) => {
    if (later.has(file) || !outputs[file]) return;
    later.add(file);
    for (const { path } of outputs[file].imports) reach(path);
  };
  for (const [file, output] of Object.entries(outputs)) {
    if (!initial.has(file) && onDemand.test(output.entryPoint ?? ""))
      reach(file);
  }
  return [...later]
    .filter((file) => !initial.has(file))
    .reduce((sum, file) => sum + gzip(resolve(root, file)), 0);
}

const gzip = (file) => gzipSync(readFileSync(file), { level: 9 }).length;

test("what a consumer ships stays within budget", async (t) => {
  assert.ok(
    existsSync(resolve(dist, "index.mjs")),
    "dist/ is missing: run `npm run build -w @nulib/clover` first",
  );
  const rows = [];
  for (const [name, exports, limit, entry, options] of [
    ["Canvas initial JS", "Canvas", budget.canvasInitialGzip],
    ["Viewer initial JS", "Viewer", budget.viewerInitialGzip],
    [
      "Classic template",
      "Classic",
      budget.classicInitialGzip,
      "templates/index.mjs",
    ],
    [
      "Document template",
      "Document",
      budget.documentInitialGzip,
      "templates/index.mjs",
    ],
    ["Map, before MapLibre", "Map", budget.mapInitialGzip, "map/index.mjs"],
    // What a Viewer loads when its Map tab is first shown: MapLibre.
    [
      "MapLibre, on a map",
      "Viewer",
      budget.mapOnDemandGzip,
      "index.mjs",
      { onDemand: /maplibre-gl/ },
    ],
  ]) {
    const out = mkdtempSync(join(tmpdir(), "clover-size-"));
    try {
      rows.push([name, await initialGzip(exports, out, entry, options), limit]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }
  rows.push([
    "styles.css",
    gzip(resolve(dist, "styles.css")),
    budget.stylesGzip,
  ]);
  rows.push([
    "templates.css",
    gzip(resolve(dist, "templates.css")),
    budget.templatesStylesGzip,
  ]);

  for (const [name, size, limit] of rows) {
    t.diagnostic(
      `${name.padEnd(18)} ${(size / 1000).toFixed(1)} kB gzip (budget ${(limit / 1000).toFixed(1)} kB)`,
    );
  }
  for (const [name, size, limit] of rows) {
    assert.ok(size <= limit, `${name} is ${size} B gzip, over ${limit} B`);
  }
});
