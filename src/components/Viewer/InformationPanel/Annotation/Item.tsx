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

/**
 * Check for 'text/plain', 'text/html', 'text/vtt', 'image/?' for starters
 */

export const AnnotationItem: React.FC<Props> = ({ annotation }) => {
  function renderItemBody(annotation: Annotation) {
    const { body, target } = annotation;
    const { format } = body as unknown as Body & EmbeddedResource;

    const viewerState: ViewerContextStore = useViewerState();
    const { openSeadragonViewer, vault, activeCanvas, configOptions } =
      viewerState;
    const canvas: CanvasNormalized = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });

    function handleClick() {
      const parsedAnnotationTarget = parseAnnotationTarget(target);

      // console.log("parsedAnnotationTarget", parsedAnnotationTarget);
      if (!parsedAnnotationTarget?.rect && !parsedAnnotationTarget.point)
        return;

      const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;

      console.log({ canvas, parsedAnnotationTarget, zoomLevel });
      const rect = createOpenSeadragonRect(
        canvas,
        parsedAnnotationTarget,
        zoomLevel,
      );

      openSeadragonViewer?.viewport.fitBounds(rect);
    }

    switch (format) {
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
      // case /^image\//.test(format):
      //   return <>an image?</>;
      default:
        return (
          <AnnotationItemPlainText
            annotation={annotation}
            handleClick={handleClick}
          />
        );
    }

    // if (body.format === "text/html") {
    //   return (
    //     <div key={i} dangerouslySetInnerHTML={{ __html: body.value }}></div>
    //   );
    // } else if (body.value) {
    //   return (
    //     <div key={i} data-target={target}>
    //       {body.value}
    //     </div>
    //   );
    // } else if (body.type === "Image") {
    //   return <img src={body.id} key={i} data-target={target} />;
    // }
  }

  // const targetJson = JSON.stringify(annotation.target);

  // if (Array.isArray(annotation.body)) {
  //   return (
  //     <Item onClick={handleClick} data-target={targetJson}>
  //       {annotation.body.map((body, i) => renderItemBody(body, targetJson, i))}
  //     </Item>
  //   );
  // }

  return <Item>{renderItemBody(annotation)}</Item>;
};

export default AnnotationItem;
