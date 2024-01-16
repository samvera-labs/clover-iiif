import {
  Annotation,
  AnnotationPage as AnnotationPageType,
} from "@iiif/presentation-3";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/AnnotationItem";
import { Group } from "src/components/Viewer/InformationPanel/AnnotationItem.styled";
import React from "react";

type Props = {
  annotationPage: AnnotationPageType;
};
export const AnnotationPage: React.FC<Props> = ({ annotationPage }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { vault } = viewerState;

  const annotations: Annotation[] | undefined = annotationPage?.items?.map(
    (item) => {
      const annotation: Annotation = vault.get(item.id);
      const body = vault.get(annotation?.body[0].id);
      return { ...annotation, body };
    },
  );

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
