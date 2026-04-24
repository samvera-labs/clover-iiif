import {
  AnnotationPageNormalized,
  CanvasNormalized,
  InternationalString,
} from "@iiif/presentation-3";

import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { parseAnnotationTarget } from "src/lib/annotation-helpers";

export interface AnimationFrame {
  body: LabeledIIIFExternalWebResource;
  label: InternationalString | null;
  startTime: number;
  endTime: number;
  duration: number;
}

export const getAnimationFrames = (
  vault: any,
  canvasId: string,
): AnimationFrame[] => {
  const canvas: CanvasNormalized = vault.get(canvasId);
  if (!canvas?.items?.length) return [];

  const annotationPage: AnnotationPageNormalized = vault.get(canvas.items[0]);
  if (!annotationPage?.items?.length) return [];

  const annotations = vault.get(annotationPage.items);
  const frames: AnimationFrame[] = [];

  for (const annotation of annotations) {
    if (!annotation?.target) continue;

    const parsed = parseAnnotationTarget(annotation.target);
    if (!parsed.t) continue;

    const parts = parsed.t.split(",").map(Number);
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) continue;

    const [startTime, endTime] = parts;

    const bodyRef = Array.isArray(annotation.body)
      ? annotation.body[0]
      : annotation.body;
    if (!bodyRef) continue;

    const bodyId = typeof bodyRef === "string" ? bodyRef : bodyRef.id;
    if (!bodyId) continue;

    const body = vault.get(bodyId);
    if (!body) continue;

    frames.push({
      body: body as LabeledIIIFExternalWebResource,
      label: annotation.label ?? null,
      startTime,
      endTime,
      duration: endTime - startTime,
    });
  }

  return frames.sort((a, b) => a.startTime - b.startTime);
};
