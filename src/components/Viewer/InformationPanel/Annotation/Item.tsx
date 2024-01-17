import React from "react";
import { Item } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import OpenSeadragon from "openseadragon";
import {
  Annotation,
  AnnotationBody,
  ContentResource,
  type CanvasNormalized,
  EmbeddedResource,
} from "@iiif/presentation-3";
import AnnotationItemPlainText from "./PlainText";
import AnnotationItemHTML from "./HTML";
import AnnotationItemVTT from "./VTT/VTT";
import { parseAnnotationTarget } from "src/lib/annotation-helpers";

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

      console.log("parsedAnnotationTarget", parsedAnnotationTarget);
    }

    // const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;

    //   if (typeof target === "string") {
    //     if (!target.includes("#xywh=")) return;

    //     const parts = target.split("#xywh=");
    //     if (parts && parts[1]) {
    //       const [x, y, w, h] = parts[1]
    //         .split(",")
    //         .map((value) => Number(value));
    //       // const scale = 1 / canvas.width;
    //       // const rect = new OpenSeadragon.Rect(
    //       //   x * scale - ((w * scale) / 2) * (zoomLevel - 1),
    //       //   y * scale - ((h * scale) / 2) * (zoomLevel - 1),
    //       //   w * scale * zoomLevel,
    //       //   h * scale * zoomLevel,
    //       // );

    //       // openSeadragonViewer.viewport.fitBounds(rect);
    //     }
    //   } else {
    //     if (target.selector?.type === "PointSelector") {
    //       const scale = 1 / canvas.width;
    //       const x = target.selector.x;
    //       const y = target.selector.y;
    //       const w = 40;
    //       const h = 40;
    //       const rect = new OpenSeadragon.Rect(
    //         x * scale - (w / 2) * scale * zoomLevel,
    //         y * scale - (h / 2) * scale * zoomLevel,
    //         w * scale * zoomLevel,
    //         h * scale * zoomLevel,
    //       );

    //       // openSeadragonViewer.viewport.fitBounds(rect);
    //     } else if (target.selector?.type === "SvgSelector") {
    //       // TODO: figure out how to get the bounding box for an svg
    //     }
    //   }
    // }

    // const handleClick = (e) => {
    //   console.log("handleClick", e.target.dataset.target);
    // };

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
