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

/** An annotation with a rectangular target, placed in the world. */
export interface PlacedAnnotation {
  id: string;
  /** Its text, if it has any: what its hotspot and its menu item are called. */
  label?: string;
  /** In world units. */
  world: Rect;
}

/**
 * The annotations that can be drawn — those with a rectangular (`xywh`) target that lands
 * on something in the scene — in the order they were given.
 */
export function placeAnnotations(
  annotations: CanvasAnnotation[],
  place: AnnotationPlacer,
): PlacedAnnotation[] {
  const placed: PlacedAnnotation[] = [];
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
  return placed;
}

interface AnnotationsProps {
  renderer: CanvasRenderer;
  placed: PlacedAnnotation[];
  /** Bumped when the scene is laid out again, so targets are re-placed. */
  sceneVersion: number;
  /** The highlighted annotation: hovered, focused, or picked from the menu. */
  active: string | null;
  onActivate: (id: string | null) => void;
  /** A hotspot clicked: zoom to it, and it becomes the menu's current annotation. */
  onSelect: (annotation: PlacedAnnotation) => void;
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
  placed,
  sceneVersion,
  active,
  onActivate,
  onSelect,
}) => {
  // Largest first, so a hotspot nested inside another stays on top and reachable.
  const ordered = [...placed].sort(
    (a, b) => b.world.width * b.world.height - a.world.width * a.world.height,
  );

  return createPortal(
    <>
      {ordered.map((entry) => (
        <AnnotationButton
          key={`${entry.id}|${sceneVersion}`}
          entry={entry}
          renderer={renderer}
          active={active === entry.id}
          onActivate={onActivate}
          onSelect={onSelect}
        />
      ))}
    </>,
    renderer.overlays.container,
  );
};

const AnnotationButton: React.FC<{
  entry: PlacedAnnotation;
  renderer: CanvasRenderer;
  active: boolean;
  onActivate: (id: string | null) => void;
  onSelect: (annotation: PlacedAnnotation) => void;
}> = ({ entry, renderer, active, onActivate, onSelect }) => {
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
        onSelect(entry);
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
export function annotationText(annotation: Annotation): string | undefined {
  const bodies = ([] as unknown[]).concat((annotation as any)?.body ?? []);
  const value = (bodies[0] as { value?: unknown } | undefined)?.value;
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (!/[<&]/.test(value) || typeof DOMParser === "undefined") return value;
  const text = new DOMParser().parseFromString(value, "text/html").body
    .textContent;
  return text?.trim() || undefined;
}

export default Annotations;
