import React from "react";
import { Item } from "src/components/Viewer/InformationPanel/AnnotationItem.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import OpenSeadragon from "openseadragon";
import { type CanvasNormalized } from "@iiif/presentation-3";

type Props = {
  item: any;
};

export const AnnotationItem: React.FC<Props> = ({ item }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { openSeadragonViewer, vault, activeCanvas, configOptions } =
    viewerState;
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  function addBBoxOverlay(viewer, bbox) {
    const div = document.createElement("div");
    div.style.backgroundColor = "rgba(0,100,200,.25)";
    viewer.addOverlay(div, bbox);
  }

  function handleClick(e) {
    if (!openSeadragonViewer) return;

    const target = JSON.parse(e.target.dataset.target);
    const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;

    if (typeof target === "string") {
      if (!target.includes("#xywh=")) return;

      const parts = target.split("#xywh=");
      if (parts && parts[1]) {
        const [x, y, w, h] = parts[1].split(",").map((value) => Number(value));
        const scale = 1 / canvas.width;
        const rect = new OpenSeadragon.Rect(
          x * scale - ((w * scale) / 2) * (zoomLevel - 1),
          y * scale - ((h * scale) / 2) * (zoomLevel - 1),
          w * scale * zoomLevel,
          h * scale * zoomLevel,
        );

        openSeadragonViewer.viewport.fitBounds(rect);
      }
    } else {
      if (target.selector?.type === "PointSelector") {
        const scale = 1 / canvas.width;
        const x = target.selector.x;
        const y = target.selector.y;
        const w = 40;
        const h = 40;
        const rect = new OpenSeadragon.Rect(
          x * scale - (w / 2) * scale * zoomLevel,
          y * scale - (h / 2) * scale * zoomLevel,
          w * scale * zoomLevel,
          h * scale * zoomLevel,
        );

        openSeadragonViewer.viewport.fitBounds(rect);
      } else if (target.selector?.type === "SvgSelector") {
        const overlayEl = document.querySelector(".annotation-overlay") as any;
        if (overlayEl) {
          const bbox = overlayEl.getBBox();
          const rect = new OpenSeadragon.Rect(
            250 * (1 / canvas.width),
            500 * (1 / canvas.height),
            1300 * (1 / canvas.width),
            950 * (1 / canvas.height),
          );
          console.log("bbox", bbox);
          console.log("rect", rect);

          addBBoxOverlay(openSeadragonViewer, rect);
        }
      }
    }
  }

  function renderItemBody(body, target, i = 0) {
    if (body.format === "text/html") {
      return (
        <div key={i} dangerouslySetInnerHTML={{ __html: body.value }}></div>
      );
    } else if (body.value) {
      return (
        <div key={i} data-target={target}>
          {body.value}
        </div>
      );
    } else if (body.type === "Image") {
      return <img src={body.id} key={i} data-target={target} />;
    }
  }

  const targetJson = JSON.stringify(item.target);

  if (Array.isArray(item.body)) {
    return (
      <Item onClick={handleClick} data-target={targetJson}>
        {item.body.map((body, i) => renderItemBody(body, targetJson, i))}
      </Item>
    );
  }

  return (
    <Item onClick={handleClick} data-target={targetJson}>
      {renderItemBody(item.body, targetJson)}
    </Item>
  );
};

export default AnnotationItem;
