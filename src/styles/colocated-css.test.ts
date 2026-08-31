import fs from "node:fs";
import path from "node:path";

import { colocatedCssPlugin } from "../../build/colocated-css.mjs";

const componentsRoot = path.join(__dirname, "../components");
const aggregateFile = path.join(__dirname, "clover.css");

const collect = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collect(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });

const componentStyles = collect(componentsRoot).sort();

/** Mirrors the convention used by `colocatedCssPlugin` in the library build. */
const ownersFor = (stylesheet: string) => {
  const dir = path.dirname(stylesheet);
  const stem = path.basename(stylesheet, ".css");
  const candidates = [
    path.join(dir, `${stem}.tsx`),
    path.join(dir, `${stem}.ts`),
  ];

  if (stem === path.basename(dir)) {
    candidates.push(path.join(dir, "index.tsx"), path.join(dir, "index.ts"));
  }

  return candidates.filter((candidate) => fs.existsSync(candidate));
};

describe("colocated component CSS", () => {
  it("adds only an owning module's neighboring stylesheet", () => {
    const plugin = colocatedCssPlugin();
    const transform = plugin.transform;
    const mapIndex = path.join(componentsRoot, "Map/index.tsx");
    const label = path.join(componentsRoot, "Primitives/Label/Label.tsx");

    expect(transform("export default null;", mapIndex)?.code).toContain(
      '"virtual:clover-map-styles.css"',
    );
    expect(transform("export default null;", mapIndex)?.code).not.toContain(
      "Controls.css",
    );
    expect(transform("export default null;", label)).toBeNull();
  });

  it("orders MapLibre before Map's colocated overrides in its leaf bundle", () => {
    const plugin = colocatedCssPlugin();
    const resolved = plugin.resolveId("virtual:clover-map-styles.css");
    const source = plugin.load(resolved);
    if (typeof source !== "string") throw new TypeError("Expected Map CSS");

    expect(source.indexOf("maplibre-gl.css")).toBeLessThan(
      source.indexOf("Map.css"),
    );
  });

  it("gives every stylesheet an owning component module", () => {
    const unowned = componentStyles
      .filter((stylesheet) => ownersFor(stylesheet).length === 0)
      .map((stylesheet) => path.relative(componentsRoot, stylesheet));

    expect(unowned).toEqual([]);
  });

  it("keeps the docs aggregate in sync with the colocated stylesheets", () => {
    const source = fs.readFileSync(aggregateFile, "utf8");
    const imported = Array.from(
      source.matchAll(/@import\s+["']([^"']+)["']\s*;/g),
      (match) => path.resolve(path.dirname(aggregateFile), match[1]),
    )
      .filter((file) => file.startsWith(`${componentsRoot}${path.sep}`))
      .sort();

    expect(imported).toEqual(componentStyles);
  });
});
