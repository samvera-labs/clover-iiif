import {
  AnnotationNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "../Annotation/Item";
import { AnnotationResource } from "src/types/annotations";
import ContentSearchForm from "src/components/Viewer/InformationPanel/ContentSearch/ContentSearchForm";
import { Group } from "../Annotation/Item.styled";
import { Label } from "src/components/Primitives";
import { getPaintingResource } from "src/hooks/use-iiif";
import { useTranslation } from "react-i18next";

type ContentSearchProps = {
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  activeCanvas: string;
  annotationPage: AnnotationResource;
};

const ContentSearch: React.FC<ContentSearchProps> = ({
  searchServiceUrl,
  setContentSearchResource,
  activeCanvas,
  annotationPage,
}) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { vault } = viewerState;

  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  useEffect(() => {
    if (!annotationPage?.items) return;

    const annotations = annotationPage?.items?.map((item) => {
      return vault.get(item.id) as AnnotationNormalized;
    });

    // loop through the annotations and group them by their target.source.id
    const groupedAnnotations = annotations.reduce((acc, annotation) => {
      // @ts-ignore
      const targetId = annotation.target.source.id;
      if (!acc[targetId]) {
        acc[targetId] = [];
      }
      acc[targetId].push(annotation.id);
      return acc;
    }, {});

    setResults(groupedAnnotations);
  }, [annotationPage]);

  let canvas;

  return (
    <>
      <ContentSearchForm
        searchServiceUrl={searchServiceUrl}
        setContentSearchResource={setContentSearchResource}
        activeCanvas={activeCanvas}
        setLoading={setLoading}
      />
      {loading ? (
        <span>{t("contentSearchLoading")}</span>
      ) : (
        results &&
        Object.keys(results).length > 0 &&
        Object.keys(results).map((key) => {
          canvas = vault.get(key);
          return (
            <Group key={key} data-testid="annotation-page">
              {canvas && (
                <header>
                  <Label label={canvas.label} />
                </header>
              )}
              {results[key].map((annotationId) => {
                const annotation = vault.get(
                  annotationId,
                ) as AnnotationNormalized;

                const painting = getPaintingResource(vault, canvas.id) as any;
                const targetResource = painting?.[0]?.service
                  ? painting?.[0]?.service[0]?.id ||
                    painting?.[0]?.service[0]?.["@id"]
                  : undefined;

                return (
                  <AnnotationItem
                    annotation={annotation}
                    targetResource={targetResource}
                    key={annotation.id}
                    isContentSearch
                  />
                );
              })}
            </Group>
          );
        })
      )}
    </>
  );
};

export default ContentSearch;
