import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  Reference,
} from "@iiif/presentation-3";
import { useEffect, useState } from "react";

import { filterAnnotationsByMotivation } from "src/lib/annotation-helpers";

const useManifestAnnotations = (items, vault, allowedMotivations?: string[]) => {
  const [processedAnnotations, setProcessedAnnotations] = useState<
    AnnotationNormalized[]
  >([]);

  useEffect(() => {
    if (!vault) return;

    const allAnnotations: AnnotationNormalized[] = [];

    items?.forEach((canvasRef: Reference<"Canvas">) => {
      const canvas: CanvasNormalized = vault.get(canvasRef);
      canvas?.annotations?.forEach(
        (annotationPageRef: Reference<"AnnotationPage">) => {
          const annotationPage: AnnotationPageNormalized =
            vault.get(annotationPageRef);
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
        },
      );
    });

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

    setProcessedAnnotations(filteredAnnotations);
  }, [items, vault, allowedMotivations]);

  return processedAnnotations;
};

export default useManifestAnnotations;
