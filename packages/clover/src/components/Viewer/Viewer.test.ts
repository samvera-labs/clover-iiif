import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as Clover from "../../index";

/**
 * `Viewer` is built only from public parts, so a consumer can copy it and change the
 * layout. Every part it imports must be exported from the package.
 */
describe("Viewer", () => {
  it("imports only parts the package exports", () => {
    const source = readFileSync(resolve(__dirname, "Viewer.tsx"), "utf8");
    const names = [
      ...source.matchAll(/import \{([^}]+)\} from "\.\.\/[A-Z]\w+\/\w+"/g),
    ].flatMap((match) =>
      match[1]
        .split(",")
        .map((name) => name.replace(/^\s*type\s+/, "").trim())
        .filter(Boolean),
    );
    expect(names.length).toBeGreaterThan(3);
    const exported = new Set(Object.keys(Clover));
    const types = ["RootProps", "ItemsLayout"];
    for (const name of names) {
      if (types.includes(name)) continue;
      expect(exported, `${name} is used by Viewer`).toContain(name);
    }
  });
});
