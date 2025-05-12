import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/Annotation/Item";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { Label } from "src/components/Primitives";
import React from "react";
import { getPaintingResource } from "src/hooks/use-iiif";

type Props = {
  contentStateAnnotation: AnnotationNormalized;
};
export const ContentStateAnnotationPage: React.FC<Props> = ({
  contentStateAnnotation,
}) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { vault } = viewerState;

  if (!contentStateAnnotation) return <></>;

  // use vault to get the canvas
  const contentStateAnnotationSource =
    // @ts-ignore
    contentStateAnnotation?.target?.source || contentStateAnnotation?.target;
  const canvas = vault.get(contentStateAnnotationSource?.id);
  const painting = getPaintingResource(vault, canvas.id) as any;
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
