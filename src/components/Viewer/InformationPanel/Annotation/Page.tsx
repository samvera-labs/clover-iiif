import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
} from "@iiif/presentation-3";
import {
  ViewerContextStore,
  useViewerState,
  useViewerDispatch,
} from "src/context/viewer-context";

import AnnotationItem from "src/components/Viewer/InformationPanel/Annotation/Item";
import { Group } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import React from "react";

type Props = {
  annotationPage: AnnotationPageNormalized;
};
export const AnnotationPage: React.FC<Props> = ({ annotationPage }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const {
    vault,
    openSeadragonViewer,
    activeCanvas,
    configOptions,
    plugins,
    activeManifest,
  } = viewerState;

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

  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  const plugin = plugins.find((plugin) => {
    let match = false;
    const annotationServer =
      plugin.informationPanel?.componentProps?.annotationServer;
    if (annotationServer) {
      match = annotationServer === annotationPage.id;
    }

    return match;
  });

  const PluginInformationPanelComponent = plugin?.informationPanel
    ?.component as unknown as React.ElementType;

  if (PluginInformationPanelComponent) {
    const annotationsWithBodies = annotations.map((annotation) => {
      return {
        ...annotation,
        body: annotation.body.map((body) => vault.get(body.id)),
      };
    });

    return (
      <Group data-testid="annotation-page">
        <PluginInformationPanelComponent
          annotations={annotationsWithBodies}
          {...plugin?.informationPanel?.componentProps}
          activeManifest={activeManifest}
          canvas={canvas}
          viewerConfigOptions={configOptions}
          openSeadragonViewer={openSeadragonViewer}
          useViewerDispatch={useViewerDispatch}
          useViewerState={useViewerState}
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
