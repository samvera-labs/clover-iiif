import fs from "node:fs";
import path from "node:path";

/**
 * Adds a component's colocated stylesheet when that component enters Vite's module graph.
 *
 * Most files pair directly (`Button.tsx` → `Button.css`). A package root pairs its
 * `index.tsx` with the directory name (`Image/index.tsx` → `Image/Image.css`). Keeping this
 * convention in the build rather than writing CSS imports in the components lets the Next.js
 * docs consume those components from source: the Pages Router rejects global CSS imports from
 * anywhere but `_app`.
 *
 * Unlike the docs-only `src/styles/clover.css` aggregate, this follows the actual dependency
 * graph. Importing helpers or i18n brings no CSS; importing Image brings Image and the shared
 * controls it actually imports; Viewer brings its complete transitive component set.
 */
function colocatedCssPlugin() {
  const componentsRoot = `${path.resolve(process.cwd(), "src/components")}${path.sep}`;
  const mapEntry = path.join(componentsRoot, "Map/index.tsx");
  const mapStyles = path.join(componentsRoot, "Map/Map.css");
  const mapLibreStyles = path.resolve(
    process.cwd(),
    "node_modules/maplibre-gl/dist/maplibre-gl.css",
  );
  const mapBundleId = "virtual:clover-map-styles.css";
  const resolvedMapBundleId = `\0${mapBundleId}`;

  return {
    name: "clover-colocated-css",
    enforce: "pre",
    resolveId(id) {
      if (id === mapBundleId) return resolvedMapBundleId;
      return null;
    },
    load(id) {
      if (id !== resolvedMapBundleId) return null;
      return [mapLibreStyles, mapStyles]
        .map((stylesheet) => `@import ${JSON.stringify(stylesheet)};`)
        .join("\n");
    },
    transform(code, id) {
      const file = id.split("?", 1)[0];
      if (!file.startsWith(componentsRoot) || !/\.[cm]?[jt]sx?$/.test(file)) {
        return null;
      }

      const dir = path.dirname(file);
      const extension = path.extname(file);
      const stem = path.basename(file, extension);
      const candidates = [path.join(dir, `${stem}.css`)];

      if (stem === "index") {
        candidates.push(path.join(dir, `${path.basename(dir)}.css`));
      }

      const styles = [...new Set(candidates)].filter((candidate) =>
        fs.existsSync(candidate),
      );
      if (!styles.length) return null;

      let componentCode = code;
      if (file === mapEntry) {
        const mapIndex = styles.indexOf(mapStyles);
        if (mapIndex !== -1) styles.splice(mapIndex, 1, mapBundleId);
        componentCode = componentCode.replace(
          /\s*await import\(["']maplibre-gl\/dist\/maplibre-gl\.css["']\);/,
          "",
        );
      }

      const imports = styles
        .map((style) => `import ${JSON.stringify(style)};`)
        .join("\n");

      /*
       * Vite emits CSS imports in reverse module-source order for this library build. Put
       * colocated imports before the component source so explicit vendor imports already in
       * that source are emitted first and Clover's overrides land last.
       */
      return { code: `${imports}\n${componentCode}`, map: null };
    },
  };
}

export { colocatedCssPlugin };
