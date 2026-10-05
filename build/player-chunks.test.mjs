import assert from "node:assert/strict";
import test from "node:test";
import { build } from "vite";
import { defineConfig } from "./base-config.mjs";
import { webComponentsConfig } from "./web-components-config.mjs";

// Inspect the emitted graph, not just the source's import() expressions: a build
// can silently inline those expressions and eagerly ship/evaluate both libraries.
function checkPlayerChunks(output) {
  const chunks = new Map(
    output
      .filter((file) => file.type === "chunk")
      .map((chunk) => [chunk.fileName, chunk]),
  );
  const initial = new Set();
  function visit(fileName, visited, dynamic = false) {
    if (visited.has(fileName) || !chunks.has(fileName)) return;
    visited.add(fileName);
    const chunk = chunks.get(fileName);
    for (const imported of chunk.imports) visit(imported, visited, dynamic);
    if (dynamic) {
      for (const imported of chunk.dynamicImports)
        visit(imported, visited, true);
    }
  }
  const hasModule = (fileNames, pattern) =>
    [...fileNames].some((name) =>
      Object.keys(chunks.get(name).modules).some((id) => pattern.test(id)),
    );
  const vidstack = /\/node_modules\/@vidstack\/react\//;
  const wavesurfer = /\/node_modules\/wavesurfer\.js\//;
  const entries = [...chunks.values()].filter((chunk) => chunk.isEntry);
  assert.equal(entries.length, 1);
  visit(entries[0].fileName, initial);
  assert.ok(
    !hasModule(initial, vidstack),
    "initial imports must exclude Vidstack",
  );
  assert.ok(
    !hasModule(initial, wavesurfer),
    "initial imports must exclude WaveSurfer",
  );

  const player = [...chunks.values()].find((chunk) =>
    Object.keys(chunk.modules).some((id) =>
      id.endsWith("/Custom/PlayerMedia.tsx"),
    ),
  );
  assert.ok(player, "custom player must be emitted");
  assert.ok(
    !initial.has(player.fileName),
    "custom player must remain deferred",
  );
  const playerImports = new Set();
  visit(player.fileName, playerImports);
  assert.ok(hasModule(playerImports, vidstack), "player must include Vidstack");
  assert.ok(
    !hasModule(playerImports, wavesurfer),
    "video/HLS must not load WaveSurfer",
  );

  const reachable = new Set();
  visit(entries[0].fileName, reachable, true);
  assert.ok(
    reachable.has(player.fileName),
    "player must be dynamically reachable",
  );
  const waveformImports = new Set();
  visit(player.fileName, waveformImports, true);
  assert.ok(
    hasModule(waveformImports, wavesurfer),
    "Sound must be able to load WaveSurfer",
  );

  for (const chunk of chunks.values()) {
    assert.ok(
      !chunk.imports.some((id) => id.startsWith("@vidstack/react")),
      "ESM-only Vidstack must stay bundled for CommonJS compatibility",
    );
    for (const imported of [...chunk.imports, ...chunk.dynamicImports]) {
      if (chunks.has(imported)) {
        assert.equal(
          imported.endsWith(".cjs"),
          chunk.fileName.endsWith(".cjs"),
          "internal chunks must preserve the entry's module format",
        );
      }
    }
  }
}

for (const [name, config] of [
  [
    "Viewer ESM and CommonJS",
    defineConfig(
      {
        lib: {
          entry: "src/components/Viewer/index.tsx",
          name: "CloverIIIFViewer",
        },
      },
      "viewer",
    ),
  ],
  ["web components", webComponentsConfig()],
]) {
  test(`${name} defer Vidstack and WaveSurfer independently`, async () => {
    config.build.write = false;
    config.logLevel = "silent";
    const results = await build(config);
    for (const result of [results].flat()) checkPlayerChunks(result.output);
  });
}
