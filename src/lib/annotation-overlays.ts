import { type CanvasNormalized } from "@iiif/presentation-3";
import OpenSeadragon from "openseadragon";
import { type ViewerConfigOptions } from "src/context/viewer-context";

import { LabeledAnnotationedResource } from "src/hooks/use-iiif/getAnnotationResources";

export function addOverlaysToViewer(
  viewer: OpenSeadragon.Viewer,
  canvas: CanvasNormalized,
  configOptions: ViewerConfigOptions,
  resources: LabeledAnnotationedResource[],
): void {
  if (!viewer) return;

  const scale = 1 / canvas.width;

  formatXywhCoordinates(resources).forEach((coor) => {
    addRectangularOverlay(
      viewer,
      coor[0] * scale,
      coor[1] * scale,
      coor[2] * scale,
      coor[3] * scale,
      configOptions,
    );
  });
}

function addRectangularOverlay(
  viewer: OpenSeadragon.Viewer,
  x: number,
  y: number,
  w: number,
  h: number,
  configOptions: ViewerConfigOptions,
): void {
  const rect = new OpenSeadragon.Rect(x, y, w, h);
  const div = document.createElement("div");

  if (configOptions.annotationOverlays) {
    const { backgroundColor, opacity, borderType, borderColor, borderWidth } =
      configOptions.annotationOverlays;

    div.style.backgroundColor = backgroundColor as string;
    div.style.opacity = opacity as string;
    div.style.border = `${borderType} ${borderWidth} ${borderColor}`;
  }

  viewer.addOverlay(div, rect);
}

export function formatXywhCoordinates(
  resources: LabeledAnnotationedResource[],
): number[][] {
  const coordinates: number[][] = [];

  resources.forEach((resource) => {
    resource.items.forEach((item) => {
      if (typeof item.target === "string" && item.target.includes("xywh=")) {
        const target = item.target as string;
        const parts = target.split("#xywh=");
        if (parts && parts[1]) {
          coordinates.push(parts[1].split(",").map((value) => Number(value)));
        }
      }
    });
  });

  return coordinates;
}
