import {
  Annotation,
  AnnotationPage as AnnotationPageType,
  ContentResource,
} from "@iiif/presentation-3";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/Annotation/Item";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import React from "react";

type Props = {
  annotationPage: AnnotationPageType;
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
    const annotation = vault.get(item.id) as Annotation;
    console.log("annotation", annotation);
    const body = annotation.body
      ? (vault.get(annotation?.body[0].id) as ContentResource)
      : {};
    return { ...annotation, body };
  });

  if (!annotations) return <></>;

  return (
    <Group>
      {annotations?.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
        ></AnnotationItem>
      ))}
    </Group>
  );
};

export default AnnotationPage;
