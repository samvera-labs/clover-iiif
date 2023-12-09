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
  const { openSeadragonViewer, vault, activeCanvas } = viewerState;
  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  function createBoundingBox(
    x: number,
    y: number,
    w: number,
    h: number,
    scale: number,
  ) {
    return new OpenSeadragon.Rect(
      x * scale - (w / 2) * scale,
      y * scale - (h / 2) * scale,
      w * scale + w * scale,
      h * scale + h * scale,
    );
  }

  function handleClick(e) {
    const target = JSON.parse(e.target.dataset.target);
    if (!openSeadragonViewer) return;

    if (typeof target === "string") {
      if (!target.includes("#xywh=")) return;

      const parts = target.split("#xywh=");
      if (parts && parts[1]) {
        const [x, y, w, h] = parts[1].split(",").map((value) => Number(value));
        const scale = 1 / canvas.width;
        const rect = createBoundingBox(x, y, w, h, scale);

        openSeadragonViewer.viewport.fitBounds(rect);
      }
    } else {
      if (target.selector?.type === "PointSelector") {
        const scale = 1 / canvas.width;
        const x = target.selector.x;
        const y = target.selector.y;
        const w = 200;
        const h = 200;
        const rect = createBoundingBox(x, y, w, h, scale);

        openSeadragonViewer.viewport.fitBounds(rect);
      }
    }
  }

  function renderItemBody(body, target, i = 0) {
    if (body.value) {
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
