import {
  AnnotationNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/Annotation/Item";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import React from "react";

type Props = {
  annotationPage: AnnotationPageNormalized;
};
export const AnnotationPage: React.FC<Props> = ({ annotationPage }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { vault } = viewerState;

  if (
    !annotationPage ||
    !annotationPage.items ||
    annotationPage.items?.length === 0
  )
    return <></>;

  const annotations = annotationPage.items.map((item) => {
    return vault.get(item.id) as AnnotationNormalized;
  });
  console.log("annotations", annotations);

  if (!annotations) return <></>;

  return (
    <Group>
      {annotations?.map((annotation) => (
        <AnnotationItem key={annotation.id} annotation={annotation} />
      ))}
    </Group>
  );
};

export default AnnotationPage;
