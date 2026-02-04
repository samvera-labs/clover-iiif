import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  EmbeddedResource,
  Reference,
} from "@iiif/presentation-3";
import { useEffect, useState } from "react";

import { filterAnnotationsByMotivation } from "src/lib/annotation-helpers";
import { AnnotationWithEmbeddedBodies } from "src/types/annotations";

const useManifestAnnotations = (
  items,
  vault,
  allowedMotivations?: string[],
) => {
  const [processedAnnotations, setProcessedAnnotations] = useState<
    AnnotationWithEmbeddedBodies[] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!vault || !items) {
      setProcessedAnnotations(undefined);
      setIsLoading(false);
      return;
    }

    if (!items.length) {
      setProcessedAnnotations([]);
      setIsLoading(false);
      return;
    }

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
        const loadedPage: AnnotationPageNormalized =
          await vault.load(annotationPageId);
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
      setProcessedAnnotations(undefined);
      const allAnnotations: AnnotationWithEmbeddedBodies[] = [];

      for (const canvasRef of items || []) {
        const canvas: CanvasNormalized = vault.get(canvasRef);
        if (!canvas?.annotations) continue;

        for (const annotationPageRef of canvas.annotations) {
          let annotationPage: AnnotationPageNormalized | undefined =
            vault.get(annotationPageRef);

          if (!annotationPage?.items?.length) {
            const referencedPage =
              await loadReferencedAnnotationPage(annotationPageRef);

            if (referencedPage?.items?.length) {
              annotationPage = referencedPage;
            }
          }

          annotationPage?.items?.forEach(
            (annotationRef: Reference<"Annotation">) => {
              const annotation: AnnotationNormalized = vault.get(annotationRef);
              if (!annotation) return;

              type BodyReference =
                | Reference<"ContentResource">
                | EmbeddedResource
                | string;

              const isEmbeddedTextualBody = (
                body: BodyReference,
              ): body is EmbeddedResource => {
                return (
                  typeof body === "object" &&
                  body !== null &&
                  "type" in body &&
                  body.type === "TextualBody"
                );
              };

              const resolvedBodies = (
                annotation.body as BodyReference[] | undefined
              )
                ?.map((bodyRef) => {
                  if (!bodyRef) return undefined;

                  if (isEmbeddedTextualBody(bodyRef)) {
                    return bodyRef;
                  }

                  const resolvedBody = vault.get(
                    bodyRef as Reference<"ContentResource">,
                  ) as EmbeddedResource | undefined;

                  return resolvedBody;
                })
                .filter((body): body is EmbeddedResource => Boolean(body));

              const { body: _unused, ...annotationWithoutBody } = annotation;
              const annotationWithEmbeddedBody: AnnotationWithEmbeddedBodies = {
                ...annotationWithoutBody,
                body: resolvedBodies,
              };

              allAnnotations.push(annotationWithEmbeddedBody);
            },
          );
        }
      }

      /**
       * Removes duplicate annotations if they exist
       */
      const uniqueAnnotations = allAnnotations.reduce(
        (
          accumulator: AnnotationWithEmbeddedBodies[],
          current: AnnotationWithEmbeddedBodies,
        ) => {
          if (
            !accumulator.some(
              (a: AnnotationWithEmbeddedBodies) => a.id === current.id,
            )
          )
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
