import type { Annotation } from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { parseAnnotationTarget } from "src/lib/annotation-helpers";
import type { CanvasRenderer, Rect } from "src/lib/renderer";

export interface CanvasAnnotation {
  annotation: Annotation;
  /** Which image in the scene the annotation targets (its index in `body`/`src`). */
  targetIndex: number;
}

/**
 * Where an annotation's rectangle sits in the world, or null if it is not on screen.
 * `rect` is in its target's own coordinates (an image, or a IIIF Canvas).
 */
export type AnnotationPlacer = (
  rect: Rect,
  targetId: string | undefined,
  targetIndex: number,
) => Rect | null;

interface AnnotationsProps {
  renderer: CanvasRenderer;
  annotations: CanvasAnnotation[];
  /** Defaults to placing by `targetIndex` among the scene's images. */
  place?: AnnotationPlacer;
  /** Bumped when the scene is laid out again, so targets are re-placed. */
  sceneVersion: number;
  onActiveChange?: (id: string | null) => void;
}

interface Placed {
  id: string;
  label?: string;
  /** In world units. */
  world: Rect;
}

/**
 * Annotation hotspots: a focusable button over each rectangular target, as `Image` draws
 * them — named by the annotation's text, marked active on hover or focus, and zoomed to
 * (with OpenSeadragon's padding) on click, Enter or Space.
 *
 * Rendered by React into the renderer's overlay layer, which pins each button to its
 * world rectangle every frame.
 */
const Annotations: React.FC<AnnotationsProps> = ({
  renderer,
  annotations,
  sceneVersion,
  onActiveChange,
  place = (rect, _, targetIndex) => renderer.itemRectToWorld(targetIndex, rect),
}) => {
  const [active, setActive] = useState<string | null>(null);

  const placed: Placed[] = [];
  for (const { annotation, targetIndex } of annotations) {
    const target = parseAnnotationTarget(annotation?.target as any);
    if (!target?.rect) continue;
    const { x, y, w, h } = target.rect;
    const world = place({ x, y, width: w, height: h }, target.id, targetIndex);
    if (!world) continue;
    placed.push({
      id: annotation.id,
      label: annotationText(annotation),
      world,
    });
  }

  // Largest first, so a hotspot nested inside another stays on top and reachable.
  placed.sort(
    (a, b) => b.world.width * b.world.height - a.world.width * a.world.height,
  );

  const activate = (id: string | null) => {
    setActive(id);
    onActiveChange?.(id);
  };

  return createPortal(
    <>
      {placed.map((entry) => (
        <AnnotationButton
          key={`${entry.id}|${sceneVersion}`}
          entry={entry}
          renderer={renderer}
          active={active === entry.id}
          onActivate={activate}
        />
      ))}
    </>,
    renderer.overlays.container,
  );
};

const AnnotationButton: React.FC<{
  entry: Placed;
  renderer: CanvasRenderer;
  active: boolean;
  onActivate: (id: string | null) => void;
}> = ({ entry, renderer, active, onActivate }) => {
  const [element, setElement] = useState<HTMLButtonElement | null>(null);
  // Re-pinned when the numbers change, not whenever a new object carries the same ones.
  const { x, y, width, height } = entry.world;

  useEffect(() => {
    if (!element) return;
    const unpin = renderer.overlays.add(element, { x, y, width, height });
    renderer.invalidate();
    return unpin;
  }, [element, renderer, x, y, width, height]);

  return (
    <button
      ref={setElement}
      type="button"
      id={entry.id}
      className="clover-canvas-annotation"
      data-active={active ? "true" : "false"}
      aria-label={entry.label}
      onMouseOver={() => onActivate(entry.id)}
      onFocus={() => onActivate(entry.id)}
      onMouseOut={() => onActivate(null)}
      onBlur={() => onActivate(null)}
      onClick={(event) => {
        event.stopPropagation();
        onActivate(entry.id);
        renderer.fitAnnotation(entry.world);
      }}
    >
      {entry.label && <label>{entry.label}</label>}
    </button>
  );
};

/**
 * The annotation's text, as plain text. A body may be HTML (`text/html`); it is read for
 * its text only, never injected as markup.
 */
function annotationText(annotation: Annotation): string | undefined {
  const bodies = ([] as unknown[]).concat((annotation as any)?.body ?? []);
  const value = (bodies[0] as { value?: unknown } | undefined)?.value;
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (!/[<&]/.test(value) || typeof DOMParser === "undefined") return value;
  const text = new DOMParser().parseFromString(value, "text/html").body
    .textContent;
  return text?.trim() || undefined;
}

export default Annotations;
