import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/Annotation/Item";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { Label } from "src/components/Primitives";
import React from "react";
import { getPaintingResource } from "src/hooks/use-iiif";
import { getTargetCanvasId } from "src/lib/annotation-helpers";

type Props = {
  contentStateAnnotation: AnnotationNormalized;
};

export const ContentStateAnnotationPage: React.FC<Props> = ({
  contentStateAnnotation,
}) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { vault } = viewerState;

  if (!contentStateAnnotation) return <></>;

  const canvasId = getTargetCanvasId(contentStateAnnotation?.target);
  const canvas = canvasId ? vault.get(canvasId) : undefined;
  const painting = canvas?.id ? (getPaintingResource(vault, canvas.id) as any) : undefined;
  const targetResource = painting?.[0]?.service
    ? painting?.[0]?.service[0]?.id || painting?.[0]?.service[0]?.["@id"]
    : undefined;

  return (
    <Group data-testid="annotation-page">
      {canvas && (
        <header>
          <Label label={canvas.label} /> <em>(Shared)</em>
        </header>
      )}
      <div data-testid="annotation-page-items">
        <AnnotationItem
          annotation={contentStateAnnotation}
          targetResource={targetResource}
          key={contentStateAnnotation.id}
          isContentState={true}
        />
      </div>
    </Group>
  );
};

export default ContentStateAnnotationPage;
