import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  Reference,
} from "@iiif/presentation-3";
import { useEffect, useState } from "react";

import { filterAnnotationsByMotivation } from "src/lib/annotation-helpers";

const useManifestAnnotations = (
  items,
  vault,
  allowedMotivations?: string[],
) => {
  const [processedAnnotations, setProcessedAnnotations] = useState<
    AnnotationNormalized[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!vault) return;

    let isActive = true;

    const loadReferencedAnnotationPage = async (
      annotationPageRef: Reference<"AnnotationPage">,
    ) => {
      const annotationPageId =
        typeof annotationPageRef === "string"
          ? annotationPageRef
          : annotationPageRef?.id;

      if (!annotationPageId) return undefined;

      try {
        const loadedPage: AnnotationPageNormalized = await vault.load(
          annotationPageId,
        );
        return loadedPage;
      } catch (error) {
        console.warn(
          `AnnotationPage ${annotationPageId} failed to load: ${error}`,
        );
        return undefined;
      }
    };

    const buildAnnotations = async () => {
      setIsLoading(true);
      const allAnnotations: AnnotationNormalized[] = [];

      for (const canvasRef of items || []) {
        const canvas: CanvasNormalized = vault.get(canvasRef);
        if (!canvas?.annotations) continue;

        for (const annotationPageRef of canvas.annotations) {
          let annotationPage: AnnotationPageNormalized | undefined =
            vault.get(annotationPageRef);

          if (!annotationPage?.items?.length) {
            const referencedPage = await loadReferencedAnnotationPage(
              annotationPageRef,
            );
            if (referencedPage?.items?.length) {
              annotationPage = referencedPage;
            }
          }

          annotationPage?.items?.forEach(
            (annotationRef: Reference<"Annotation">) => {
              const annotation: AnnotationNormalized = vault.get(annotationRef);
              if (annotation) {
                allAnnotations.push({
                  ...annotation,
                  body: annotation?.body?.map((bodyRef) => vault.get(bodyRef)),
                });
              }
            },
          );
        }
      }

      /**
       * Removes duplicate annotations if they exist
       */
      const uniqueAnnotations = allAnnotations.reduce(
        (accumulator: AnnotationNormalized[], current: AnnotationNormalized) => {
          if (!accumulator.some((a: AnnotationNormalized) => a.id === current.id))
            accumulator.push(current);
          return accumulator;
        },
        [],
      );

      const filteredAnnotations = filterAnnotationsByMotivation(
        uniqueAnnotations,
        allowedMotivations,
      );

      if (isActive) {
        setProcessedAnnotations(filteredAnnotations);
      }
    };

    buildAnnotations().finally(() => {
      if (isActive) {
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [items, vault, allowedMotivations]);

  return { annotations: processedAnnotations, isLoading };
};

export default useManifestAnnotations;
