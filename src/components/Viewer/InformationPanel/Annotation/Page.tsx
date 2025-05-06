import {
  AnnotationNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/Annotation/Item";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { Label } from "src/components/Primitives";
import React from "react";
import { getPaintingResource } from "src/hooks/use-iiif";

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

  if (!annotations) return <></>;

  //  build new array for each unique anotation.target.source.id and return each relative annotation id as a array under it
  const items = annotations.reduce((acc, annotation) => {
    // @ts-ignore
    acc["canvas"] = annotation.target.source.id;
    acc["annotations"] = [];
    acc["annotations"].push(annotation?.id);
    return acc;
  }, {});

  // use vault to get the canvas
  // @ts-ignore
  const canvas = vault.get(items.canvas);
  const painting = getPaintingResource(vault, canvas.id) as any;
  const targetResource = painting?.[0]?.service
    ? painting?.[0]?.service[0]?.id || painting?.[0]?.service[0]?.["@id"]
    : undefined;

  return (
    <Group data-testid="annotation-page">
      {canvas && (
        <header>
          <Label label={canvas.label} />
        </header>
      )}
      <div data-testid="annotation-page-items">
        {annotations?.map((annotation) => (
          <AnnotationItem
            annotation={annotation}
            targetResource={targetResource}
            key={annotation.id}
          />
        ))}
      </div>
    </Group>
  );
};

export default AnnotationPage;
