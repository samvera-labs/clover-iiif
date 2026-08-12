import { hexToHueSaturation } from "docs/components/Playground/playground-config";

/**
 * Site-wide accent override.
 *
 * The playground's accent swatches are not a preview control — they retint the whole
 * site, docs pages included. That means the value cannot live in the playground's
 * React state alone: it has to be applied to the document root, survive navigation
 * away from the homepage, and be restored on a cold load of any page.
 *
 * Everything derives from two things:
 *
 *  - `--accent-9`, the single literal in the docs accent scale. Every other step is
 *    mixed from it in `tokens.css`, and `--clover-color-accent` maps to it, so this
 *    one property retints the docs chrome and any rendered Clover component.
 *  - `--nextra-primary-hue` / `--nextra-primary-saturation`, which Nextra composes
 *    its own primary colors from in `hsl()`. It takes hue and saturation as
 *    variables and bakes lightness into each utility, so handing it H and S shifts
 *    the whole family while leaving Nextra's light/dark contrast choices intact.
 */

const STORAGE_KEY = "clover-docs-accent";

const OWNED_PROPERTIES = [
  "--accent-9",
  "--nextra-primary-hue",
  "--nextra-primary-saturation",
];

/** Guards against a stored value being anything other than a plain hex color. */
const isHexColor = (value: string) =>
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

/** Applies an accent to the document root, or clears the override when falsy. */
export const applyAccent = (accent: string) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (!accent || !isHexColor(accent)) {
    OWNED_PROPERTIES.forEach((prop) => root.style.removeProperty(prop));
    return;
  }

  const { hue, saturation } = hexToHueSaturation(accent);
  root.style.setProperty("--accent-9", accent);
  root.style.setProperty("--nextra-primary-hue", `${hue}deg`);
  root.style.setProperty("--nextra-primary-saturation", `${saturation}%`);
};

export const storeAccent = (accent: string) => {
  try {
    if (accent) localStorage.setItem(STORAGE_KEY, accent);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing or a full quota — the accent simply will not persist.
  }
};

export const readStoredAccent = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && isHexColor(stored) ? stored : "";
  } catch {
    return "";
  }
};
