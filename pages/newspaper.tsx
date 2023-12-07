import React from "react";

import Viewer from "docs/components/DynamicImports/Viewer";
import { getAnnotationResources } from "src/hooks/use-iiif";
import { LabeledAnnotationedResource } from "src/hooks/use-iiif/getAnnotationResources";

const highlightColor = "#ff8d8d";
const highlightOpacity = "0.5";
const highlightBorderWidth = "1px";
const highlightBorderColor = "black";

function Newspaper() {
  const iiifContent =
    "http://localhost:3000/manifest/newspaper/newspaper_collection.json";

  function addOverlaysToViewer(viewer, OpenSeadragon, vault, activeCanvas) {
    const resources = getAnnotationResources(vault, activeCanvas);
    if (resources.length === 0) return;

    const canvas = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });
    const scale = 1 / canvas.width;

    formatCoordinates(resources).forEach((coor) => {
      addOverlay(
        OpenSeadragon,
        viewer,
        coor[0] * scale,
        coor[1] * scale,
        coor[2] * scale,
        coor[3] * scale,
        highlightColor,
        highlightOpacity,
      );
    });
  }

  return (
    <Viewer
      iiifContent={iiifContent}
      osdViewerCallback={addOverlaysToViewer}
      options={{ informationPanel: { renderAbout: true } }}
    />
  );
}

function addOverlay(
  OpenSeadragon: any,
  viewer: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  backgroundColor: string,
  opacity: string,
) {
  const rect = new OpenSeadragon.Rect(x1, y1, x2, y2);

  const div = document.createElement("div");
  div.className = "ocr-overlay";
  div.style.backgroundColor = backgroundColor;
  div.style.opacity = opacity;
  div.style.border = `solid ${highlightBorderWidth} ${highlightBorderColor}`;

  viewer.addOverlay(div, rect);
}

function formatCoordinates(
  resources: LabeledAnnotationedResource[],
): number[][] {
  resources[0].items.some((item) => item.target);

  const coordinates: number[][] = [];
  resources
    .filter((resource) => {
      return resource.items.some((item) => {
        if (typeof item.target === "string") {
          return item.target.includes("xywh=");
        }
      });
    })
    .forEach((resource) => {
      resource.items.forEach((item) => {
        const target = item.target as string;
        const parts = target.split("xywh=");
        if (parts && parts[1]) {
          coordinates.push(parts[1].split(",").map((value) => Number(value)));
        }
      });
    });

  return coordinates;
}

export default Newspaper;
