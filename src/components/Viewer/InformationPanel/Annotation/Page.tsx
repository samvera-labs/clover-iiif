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
import { getTargetCanvasId } from "src/lib/annotation-helpers";

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

  const canvasId = annotations
    .map((annotation) => getTargetCanvasId(annotation?.target))
    .find(Boolean);
  const canvas = canvasId ? vault.get(canvasId) : undefined;
  const painting = canvas?.id ? (getPaintingResource(vault, canvas.id) as any) : undefined;
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
