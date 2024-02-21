import React, { useState } from "react";
import {
  AnnotationNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import ContentSearchItem from "src/components/Viewer/InformationPanel/ContentSearch/Item";
import { List } from "src/components/Viewer/InformationPanel/ContentSearch/Item.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import { getLabel } from "src/hooks/use-iiif";

type Props = {
  annotationPage: AnnotationPageNormalized;
};
type GroupedAnnotations = {
  [k: string]: AnnotationNormalized[];
};
export const ContentSearchPage: React.FC<Props> = ({ annotationPage }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { contentSearchVault } = viewerState;

  const [activeTarget, setActiveTarget] = useState<string | undefined>();

  function formatAnnotationPage(annotationPage: AnnotationPageNormalized) {
    const groupedAnnotations: GroupedAnnotations = {};
    annotationPage.items.forEach((item) => {
      const annotation = contentSearchVault.get(
        item.id,
      ) as AnnotationNormalized;
      let label = "";
      if (annotation.label) {
        const internationalLabel = getLabel(annotation.label);
        if (internationalLabel) {
          label = internationalLabel[0];
        }
      }

      if (groupedAnnotations[label] == undefined) {
        groupedAnnotations[label] = [];
      }
      groupedAnnotations[label].push(annotation);
    });
    return groupedAnnotations;
  }

  if (
    !annotationPage ||
    !annotationPage.items ||
    annotationPage.items?.length === 0
  )
    return <div>No search results.</div>;

  const annotations = annotationPage.items.map((item) => {
    return contentSearchVault.get(item.id) as AnnotationNormalized;
  });

  if (!annotations) return <></>;

  const groupedAnnotations = formatAnnotationPage(annotationPage);

  return (
    <div>
      {Object.entries(groupedAnnotations).map(([label, annotations], i) => {
        return (
          <List key={i}>
            {label}
            {annotations.map((annotation, i) => (
              <ContentSearchItem
                key={i}
                annotation={annotation}
                activeTarget={activeTarget}
                setActiveTarget={setActiveTarget}
              />
            ))}
          </List>
        );
      })}
    </div>
  );
};

export default ContentSearchPage;
