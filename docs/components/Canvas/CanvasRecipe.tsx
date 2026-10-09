import CloverCanvas from "docs/components/DynamicImports/Canvas";
import type { CloverCanvasOptions } from "src/components/Canvas";
import { useEffect, useMemo, useState } from "react";
import { resolveDirection } from "src/components/Canvas/layout";
import { groupViews, resolveBehavior } from "src/lib/iiif-sequence";

/**
 * A IIIF Cookbook recipe, shown the way a host shows a Manifest with `Canvas`.
 *
 * `Canvas` draws the Canvases it is handed and nothing else. Everything Manifest-level
 * happens here, in the host: reading `behavior` to group the Canvases into views (single
 * pages, spreads, one joined object), passing `viewingDirection` on, and stepping
 * through the views with its own controls.
 *
 * Two cases have no recipe of their own, a `facing-pages` Canvas and a `bottom-to-top`
 * sequence, so those adapt a real recipe: `adapt` edits the Manifest after fetching it,
 * and `behavior` / `viewingDirection` stand in for the Manifest's own.
 */
const CanvasRecipe = ({
  id,
  iiifContent,
  adapt,
  behavior,
  viewingDirection,
  options,
  height = 420,
}: {
  id: string;
  iiifContent: string;
  adapt?: (manifest: any) => any;
  behavior?: string;
  viewingDirection?: string;
  /** Passed straight to `Canvas`, e.g. `{ media: { presentation: "texture" } }`. */
  options?: CloverCanvasOptions;
  height?: number;
}) => {
  const [manifest, setManifest] = useState<any>(null);
  const [viewIndex, setViewIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(iiifContent)
      .then((response) => response.json())
      .then((json) => {
        if (cancelled) return;
        setManifest(adapt ? adapt(json) : json);
        setViewIndex(0);
      });
    return () => {
      cancelled = true;
    };
  }, [iiifContent, adapt]);

  const canvases = useMemo(() => manifest?.items ?? [], [manifest]);
  const views = useMemo(
    () => groupViews(canvases, resolveBehavior(behavior ?? manifest?.behavior)),
    [canvases, behavior, manifest],
  );
  const direction = resolveDirection(
    viewingDirection ?? manifest?.viewingDirection,
  );
  const shown = useMemo(
    () => (views[viewIndex] ?? []).map((index) => canvases[index]),
    [views, viewIndex, canvases],
  );

  // The host's own stepper, ordered as the object reads.
  const reversed =
    direction === "right-to-left" || direction === "bottom-to-top";
  const vertical =
    direction === "top-to-bottom" || direction === "bottom-to-top";
  const step = (label: string, delta: number, glyph: string) => (
    <button
      type="button"
      onClick={() => setViewIndex((index) => index + delta)}
      disabled={viewIndex + delta < 0 || viewIndex + delta >= views.length}
      style={{
        padding: "0.25rem 0.875rem",
        borderRadius: "999px",
        border: "1px solid currentColor",
        background: "transparent",
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <span aria-hidden="true">{glyph}</span> {label}
    </button>
  );
  const previous = step(
    "Previous",
    -1,
    vertical ? (reversed ? "↓" : "↑") : reversed ? "→" : "←",
  );
  const next = step(
    "Next",
    1,
    vertical ? (reversed ? "↑" : "↓") : reversed ? "←" : "→",
  );

  return (
    <div data-demo={id} style={{ margin: "1rem 0 2rem" }}>
      <div
        style={{
          position: "relative",
          height,
          backgroundColor: "var(--surface-sunken, #f0f0f0)",
        }}
      >
        {shown.length > 0 && (
          <CloverCanvas
            canvases={shown}
            viewingDirection={direction}
            options={options}
          />
        )}
      </div>
      {views.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginTop: "0.75rem",
          }}
        >
          {reversed ? next : previous}
          <output aria-live="polite">
            View {viewIndex + 1} of {views.length}
          </output>
          {reversed ? previous : next}
        </div>
      )}
    </div>
  );
};

export default CanvasRecipe;
