import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
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
  const { vault, openSeadragonViewer, activeCanvas, configOptions, plugins } =
    viewerState;

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

  const plugin = plugins.find((plugin) => {
    let match = false;
    if (plugin.informationPanel?.annotationPageId) {
      match = plugin.informationPanel.annotationPageId.includes(
        annotationPage.id,
      );
    }

    return match;
  });

  const PluginInformationPanel = plugin?.informationPanel
    ?.component as unknown as React.ElementType;

  if (PluginInformationPanel) {
    const annotationsWithBodies = annotations.map((annotation) => {
      return {
        ...annotation,
        body: annotation.body.map((body) => vault.get(body.id)),
      };
    });
    const canvas: CanvasNormalized = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });

    return (
      <Group data-testid="annotation-page">
        <PluginInformationPanel
          canvas={canvas}
          openSeadragonViewer={openSeadragonViewer}
          annotations={annotationsWithBodies}
          configOptions={configOptions}
        />
      </Group>
    );
  }

  return (
    <Group data-testid="annotation-page">
      {annotations?.map((annotation) => (
        <AnnotationItem key={annotation.id} annotation={annotation} />
      ))}
    </Group>
  );
};

export default AnnotationPage;
