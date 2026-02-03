import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useManifestAnnotations from "./useManifestAnnotations";

import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  Reference,
} from "@iiif/presentation-3";

describe("useManifestAnnotations", () => {
  it("loads and returns annotations from referenced annotation pages", async () => {
    const canvasRef = {
      id: "https://example.org/canvas/1",
      type: "Canvas",
    } as Reference<"Canvas">;
    const annotationPageRef = {
      id: "https://example.org/canvas/1/annotations",
      type: "AnnotationPage",
    } as Reference<"AnnotationPage">;
    const annotationRef = {
      id: "https://example.org/anno/1",
      type: "Annotation",
    } as Reference<"Annotation">;

    const annotation = {
      id: annotationRef.id,
      type: "Annotation",
      motivation: "commenting",
      body: [],
    } as AnnotationNormalized;

    const vault = {
      get: vi.fn((reference) => {
        if (reference === canvasRef) {
          return {
            ...canvasRef,
            annotations: [annotationPageRef],
          } as CanvasNormalized;
        }

        if (reference === annotationPageRef) {
          return {
            ...annotationPageRef,
            items: [],
          } as AnnotationPageNormalized;
        }

        if (reference === annotationRef) {
          return annotation;
        }

        return undefined;
      }),
      load: vi.fn(async () => ({
        ...annotationPageRef,
        items: [annotationRef],
      })),
    };

    const items = [canvasRef];
    const { result } = renderHook(() =>
      useManifestAnnotations(items, vault, undefined),
    );

    await waitFor(() => expect(result.current.annotations).toHaveLength(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(vault.load).toHaveBeenCalledWith(annotationPageRef.id);
    expect(result.current.annotations[0].id).toBe(annotationRef.id);
  });
});
