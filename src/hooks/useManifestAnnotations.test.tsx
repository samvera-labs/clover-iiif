import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useManifestAnnotations from "./useManifestAnnotations";

import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  EmbeddedResource,
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

  it("preserves inline textual bodies when Vault cannot resolve a reference", async () => {
    const canvasRef = {
      id: "https://example.org/canvas/2",
      type: "Canvas",
    } as Reference<"Canvas">;
    const annotationPageRef = {
      id: "https://example.org/canvas/2/annotations",
      type: "AnnotationPage",
    } as Reference<"AnnotationPage">;
    const annotationRef = {
      id: "https://example.org/anno/2",
      type: "Annotation",
    } as Reference<"Annotation">;

    const inlineBody = {
      type: "TextualBody",
      value: "Inline body",
      format: "text/plain",
      language: "en",
    } as EmbeddedResource;

    const annotation = {
      id: annotationRef.id,
      type: "Annotation",
      motivation: "commenting",
      body: [inlineBody],
      target: {
        source: {
          id: canvasRef.id,
          type: "Canvas",
        },
      },
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
            items: [annotationRef],
          } as AnnotationPageNormalized;
        }

        if (reference === annotationRef) {
          return annotation;
        }

        if (reference === inlineBody) {
          return undefined;
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

    expect(result.current.annotations[0].body?.[0]?.value).toBe("Inline body");
  });
});
