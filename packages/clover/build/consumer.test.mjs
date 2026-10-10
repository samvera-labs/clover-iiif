/*
 * @nulib/clover as a consumer meets it: through the package name, from the built `dist/`.
 * Run `npm run build -w @nulib/clover` first.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test.before(() => {
  assert.ok(
    existsSync(resolve(root, "dist/index.mjs")),
    "dist/ is missing: run `npm run build -w @nulib/clover` first",
  );
});

test("a namespace import that uses only groupViews pulls in no renderer", async () => {
  const result = await esbuild({
    stdin: {
      contents: `import * as Clover from "@nulib/clover";\nconsole.log(Clover.groupViews([], "individuals"));`,
      resolveDir: root,
      sourcefile: "entry.mjs",
    },
    bundle: true,
    format: "esm",
    write: false,
    metafile: true,
    external: ["react", "react-dom", "react/jsx-runtime"],
    logLevel: "silent",
  });
  // `metafile.inputs` lists every module parsed; what survives tree shaking is what
  // contributes bytes to the output.
  const [output] = Object.values(result.metafile.outputs);
  const inputs = Object.entries(output.inputs)
    .filter(([, { bytesInOutput }]) => bytesInOutput > 0)
    .map(([id]) => id);
  const leaked = inputs.filter((id) =>
    /dist\/(components|lib\/renderer|ui)\//.test(id),
  );
  assert.deepEqual(leaked, [], "only the sequence module should be bundled");
  assert.ok(inputs.some((id) => id.endsWith("dist/core/sequence.mjs")));
});

test("the templates entry imports in plain node", () => {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const Templates = await import("@nulib/clover/templates");
       console.log(JSON.stringify({
         Classic: typeof Templates.Classic,
         Gallery: typeof Templates.Gallery,
         Text: typeof Templates.Text,
       }));`,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(status, 0, stderr);
  assert.deepEqual(JSON.parse(stdout.trim()), {
    Classic: "function",
    Gallery: "function",
    Text: "function",
  });
});

// The bundle test proves MapLibre is never imported statically; this proves the entry runs.
test("the map entry imports in plain node", () => {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const Map = await import("@nulib/clover/map");
       console.log(JSON.stringify({
         Map: typeof Map.Map,
         navPlaceOf: typeof Map.navPlaceOf,
       }));`,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(status, 0, stderr);
  assert.deepEqual(JSON.parse(stdout.trim()), {
    Map: "object",
    navPlaceOf: "function",
  });
});

test("plain node can import the package", () => {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const Clover = await import("@nulib/clover");
       console.log(JSON.stringify({
         Canvas: typeof Clover.Canvas,
         groupViews: typeof Clover.groupViews,
         initCloverI18n: typeof Clover.initCloverI18n,
       }));`,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(status, 0, stderr);
  assert.deepEqual(JSON.parse(stdout.trim()), {
    Canvas: "function",
    groupViews: "function",
    initCloverI18n: "function",
  });
});
