import type { Annotation } from "@iiif/presentation-3";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { bodiesOf, parseAnnotationTarget } from "../../core/annotations";
import type { SvgShape } from "../../core/svg-shape";

/** Reads an SvgSelector's shapes: `core/svg-shape.ts`, loaded when a shape needs it. */
export type SvgReader = (svg: string) => SvgShape | null;

let svgReader: SvgReader | null = null;

/**
 * The SVG reader, once loaded. It loads the first time an annotation in view has an
 * SvgSelector, and not before: rectangles and points need none of it (1.3 kB).
 */
export function useSvgReader(
  annotations: CanvasAnnotation[] | undefined,
): SvgReader | null {
  const needed = useMemo(
    () =>
      Boolean(
        annotations?.some(
          ({ annotation }) =>
            parseAnnotationTarget(annotation?.target as any)?.svg,
        ),
      ),
    [annotations],
  );
  const [reader, setReader] = useState<SvgReader | null>(() => svgReader);
  useEffect(() => {
    if (!needed || reader) return;
    let live = true;
    void import("../../core/svg-shape").then((module) => {
      svgReader = module.readSvgShape;
      if (live) setReader(() => module.readSvgShape);
    });
    return () => {
      live = false;
    };
  }, [needed, reader]);
  return reader;
}
import type { CanvasRenderer, Rect } from "../../lib/renderer";

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

/** An annotation placed in the world: its box, and the shape drawn in it. */
export interface PlacedAnnotation {
  id: string;
  /** Its text, if it has any: what its hotspot and its menu item are called. */
  label?: string;
  /**
   * In world units: the rectangle, the box an SVG shape fills, or the box around a point
   * (what zooming to it frames).
   */
  world: Rect;
  /** A point's marker, or an SVG shape drawn in `world`; a rectangle needs neither. */
  shape?: { kind: "point" } | { kind: "svg"; svg: SvgShape };
}

/** The box framed around a point, in its target's own units, as 3.x frames one. */
const POINT_BOX = 40;

/**
 * The annotations that can be drawn — a rectangle (`xywh`), a point (PointSelector) or a
 * shape (SvgSelector) on something in the scene — in the order they were given.
 */
export function placeAnnotations(
  annotations: CanvasAnnotation[],
  place: AnnotationPlacer,
  /** Reads SVG shapes; until it has loaded, shapes wait (see `useSvgReader`). */
  readSvg: SvgReader | null = null,
): PlacedAnnotation[] {
  const placed: PlacedAnnotation[] = [];
  for (const { annotation, targetIndex } of annotations) {
    const target = parseAnnotationTarget(annotation?.target as any);
    if (!target) continue;
    let rect: Rect | null = null;
    let shape: PlacedAnnotation["shape"];
    if (target.rect) {
      const { x, y, w, h } = target.rect;
      rect = { x, y, width: w, height: h };
    } else if (target.point) {
      const { x, y } = target.point;
      rect = {
        x: x - POINT_BOX / 2,
        y: y - POINT_BOX / 2,
        width: POINT_BOX,
        height: POINT_BOX,
      };
      shape = { kind: "point" };
    } else if (target.svg && readSvg) {
      const svg = readSvg(target.svg);
      if (svg) {
        rect = svg.box;
        shape = { kind: "svg", svg };
      }
    }
    if (!rect) continue;
    const world = place(rect, target.id, targetIndex);
    if (!world) continue;
    placed.push({
      id: annotation.id,
      label: annotationText(annotation),
      world,
      ...(shape ? { shape } : {}),
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
      data-shape={entry.shape?.kind ?? "rect"}
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
      {entry.shape?.kind === "point" && (
        <span className="clover-canvas-annotation-point" aria-hidden="true" />
      )}
      {entry.shape?.kind === "svg" && <ShapeOutline svg={entry.shape.svg} />}
      {entry.label && <label>{entry.label}</label>}
    </button>
  );
};

/**
 * An SvgSelector's shapes, drawn to fill the hotspot: the viewBox is their box, so they
 * scale with the pinned element. Rebuilt from their read geometry, never the markup.
 */
const ShapeOutline: React.FC<{ svg: SvgShape }> = ({ svg }) => {
  const { x, y, width, height } = svg.box;
  return (
    <svg
      className="clover-canvas-annotation-shape"
      viewBox={`${x} ${y} ${Math.max(width, 1)} ${Math.max(height, 1)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {svg.shapes.map(({ tag, attributes }, index) =>
        React.createElement(tag, {
          key: index,
          ...attributes,
          vectorEffect: "non-scaling-stroke",
        }),
      )}
    </svg>
  );
};

/**
 * The annotation's text, as plain text. A body may be HTML (`text/html`); it is read for
 * its text only, never injected as markup.
 */
export function annotationText(annotation: Annotation): string | undefined {
  const value = bodiesOf(annotation as any).find(
    (body) => typeof body?.value === "string",
  )?.value;
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (!/[<&]/.test(value) || typeof DOMParser === "undefined") return value;
  const text = new DOMParser().parseFromString(value, "text/html").body
    .textContent;
  return text?.trim() || undefined;
}

export default Annotations;
