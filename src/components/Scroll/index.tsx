import React, { useContext, useEffect, useState } from "react";
import {
  ScrollContext,
  ScrollProvider,
  type ScrollOptions,
} from "src/context/scroll-context";

import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  ManifestNormalized,
  Reference,
} from "@iiif/presentation-3";
import ScrollHeader from "src/components/Scroll/Layout/Header";
import ScrollItems from "src/components/Scroll/Items/Items";
import { StyledScrollWrapper } from "src/components/Scroll/Layout/Layout.styled";
import {
  extractLanguages,
  filterAnnotationsByMotivation,
} from "src/lib/annotation-helpers";

export interface CloverScrollProps {
  iiifContent: string;
  options?: ScrollOptions;
}

const RenderCloverScroll = ({ iiifContent }: { iiifContent: string }) => {
  const [manifest, setManifest] = useState<ManifestNormalized>();
  const [hasDefinedLanguages, setHasDefinedLanguages] = useState(false);

  const { state, dispatch } = useContext(ScrollContext);
  const { options, vault, annotations } = state;

  useEffect(() => {
    if (!vault) return;

    vault
      .load(iiifContent)
      .then((data: ManifestNormalized) => data && setManifest(data))
      .catch((error: Error) =>
        console.error(`Manifest ${iiifContent} failed to load: ${error}`),
      );
  }, [iiifContent, vault]);

  useEffect(() => {
    if (!vault) {
      dispatch({ type: "updateAnnotations", payload: undefined });
      dispatch({ type: "updateAnnotationsLoading", payload: false });
      return;
    }

    if (!manifest?.items) {
      dispatch({ type: "updateAnnotations", payload: [] });
      dispatch({ type: "updateAnnotationsLoading", payload: false });
      return;
    }

    let isActive = true;

    const loadReferencedAnnotationPage = async (
      annotationPageRef: Reference<"AnnotationPage">,
    ): Promise<AnnotationPageNormalized | undefined> => {
      const annotationPageId =
        typeof annotationPageRef === "string"
          ? annotationPageRef
          : annotationPageRef?.id;

      if (!annotationPageId) return undefined;

      try {
        const loadedPage = (await vault.load(
          annotationPageId,
        )) as AnnotationPageNormalized | undefined;
        return loadedPage;
      } catch (error) {
        console.warn(
          `AnnotationPage ${annotationPageId} failed to load: ${error}`,
        );
        return undefined;
      }
    };

    const buildAnnotations = async () => {
      dispatch({ type: "updateAnnotationsLoading", payload: true });
      const allAnnotations: AnnotationNormalized[] = [];

      for (const canvasRef of manifest.items || []) {
        const canvas = vault.get(canvasRef) as CanvasNormalized | undefined;
        if (!canvas?.annotations) continue;

        for (const annotationPageRef of canvas.annotations) {
          let annotationPage = vault.get(
            annotationPageRef,
          ) as AnnotationPageNormalized | undefined;

          if (!annotationPage?.items?.length) {
            const referencedPage =
              await loadReferencedAnnotationPage(annotationPageRef);

            if (referencedPage?.items?.length) {
              annotationPage = referencedPage;
            }
          }

          annotationPage?.items?.forEach(
            (annotationRef: Reference<"Annotation">) => {
              const annotation = vault.get(
                annotationRef,
              ) as AnnotationNormalized | undefined;
              if (!annotation) return;
              allAnnotations.push(annotation);
            },
          );
        }
      }

      const uniqueAnnotations = allAnnotations.reduce(
        (
          accumulator: AnnotationNormalized[],
          current: AnnotationNormalized,
        ) => {
          if (!accumulator.some((a) => a.id === current.id)) {
            accumulator.push(current);
          }
          return accumulator;
        },
        [],
      );

      const filteredAnnotations = filterAnnotationsByMotivation(
        uniqueAnnotations,
        options?.annotations?.motivations,
      );

      if (isActive) {
        dispatch({ type: "updateAnnotations", payload: filteredAnnotations });
      }
    };

    buildAnnotations().finally(() => {
      if (isActive) {
        dispatch({ type: "updateAnnotationsLoading", payload: false });
      }
    });

    return () => {
      isActive = false;
    };
  }, [manifest, vault, options?.annotations?.motivations, dispatch]);

  useEffect(() => {
    if (!vault) return;
    if (annotations === undefined) {
      setHasDefinedLanguages(false);
      return;
    }

    const extractedLanguages = extractLanguages(annotations || [], vault);
    const activeLanguages = !extractedLanguages.length
      ? []
      : options?.language?.defaultLanguages || extractedLanguages;

    setHasDefinedLanguages(Boolean(extractedLanguages.length));

    dispatch({
      type: "updateActiveLanguages",
      payload: activeLanguages,
    });
  }, [annotations, vault, options?.language?.defaultLanguages, dispatch]);

  if (!manifest) return null;

  return (
    <StyledScrollWrapper>
      {manifest && (
        <>
          <ScrollHeader
            label={manifest?.label}
            hasDefinedLanguages={hasDefinedLanguages}
          />
          <ScrollItems items={manifest.items} />
        </>
      )}
    </StyledScrollWrapper>
  );
};

const CloverScroll: React.FC<CloverScrollProps> = ({
  iiifContent,
  options,
}) => {
  return (
    <ScrollProvider options={options}>
      <RenderCloverScroll iiifContent={iiifContent} />
    </ScrollProvider>
  );
};

export default CloverScroll;
