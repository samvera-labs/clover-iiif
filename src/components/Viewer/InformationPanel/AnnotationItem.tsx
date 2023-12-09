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

  function handleClick(e) {
    const target = e.target.dataset.target;

    if (typeof target === "string" && target.includes("#xywh=")) {
      const parts = target.split("#xywh=");
      if (parts && parts[1]) {
        const [x, y, w, h] = parts[1].split(",").map((value) => Number(value));
        const scale = 1 / canvas.width;
        const rect = new OpenSeadragon.Rect(
          x * scale - (w / 2) * scale,
          y * scale - (h / 2) * scale,
          w * scale + w * scale,
          h * scale + h * scale,
        );
        if (openSeadragonViewer) {
          openSeadragonViewer.viewport.fitBounds(rect);
        }
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

  if (Array.isArray(item.body)) {
    return (
      <Item onClick={handleClick} data-target={item.target}>
        {item.body.map((body, i) => renderItemBody(body, item.target, i))}
      </Item>
    );
  }

  return (
    <Item onClick={handleClick} data-target={item.target}>
      {renderItemBody(item.body, item.target)}
    </Item>
  );
};

export default AnnotationItem;
