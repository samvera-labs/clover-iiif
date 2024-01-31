import React from "react";
import { Item } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import {
  Annotation,
  type CanvasNormalized,
  EmbeddedResource,
} from "@iiif/presentation-3";
import AnnotationItemPlainText from "./PlainText";
import AnnotationItemHTML from "./HTML";
import AnnotationItemVTT from "./VTT/VTT";
import { parseAnnotationTarget } from "src/lib/annotation-helpers";
import { createOpenSeadragonRect } from "src/lib/openseadragon-helpers";

type Props = {
  annotation: Annotation;
};

export const AnnotationItem: React.FC<Props> = ({ annotation }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { openSeadragonViewer, vault, activeCanvas, configOptions } =
    viewerState;

  function renderItemBody(annotation: Annotation) {
    const { body, target } = annotation;
    const { format: annotationBodyFormat } = body as unknown as Body &
      EmbeddedResource;

    const canvas: CanvasNormalized = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });

    function handleClick() {
      if (!target) return;

      const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;
      const parsedAnnotationTarget = parseAnnotationTarget(target);

      const { point, rect, svg } = parsedAnnotationTarget;

      if (point || rect || svg) {
        const rect = createOpenSeadragonRect(
          canvas,
          parsedAnnotationTarget,
          zoomLevel,
        );
        openSeadragonViewer?.viewport.fitBounds(rect);
      }
    }

    switch (annotationBodyFormat) {
      case "text/plain":
        return (
          <AnnotationItemPlainText
            annotation={annotation}
            handleClick={handleClick}
          />
        );
      case "text/html":
        return (
          <AnnotationItemHTML
            annotation={annotation}
            handleClick={handleClick}
          />
        );
      case "text/vtt":
        return <AnnotationItemVTT annotation={annotation} />;
      // case /^image\//.test(annotationBodyFormat):
      //   return <>an image?</>;
      default:
        return (
          <AnnotationItemPlainText
            annotation={annotation}
            handleClick={handleClick}
          />
        );
    }
  }

  return <Item>{renderItemBody(annotation)}</Item>;
};

export default AnnotationItem;
