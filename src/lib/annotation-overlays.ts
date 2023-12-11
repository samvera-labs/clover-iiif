import { type CanvasNormalized } from "@iiif/presentation-3";
import OpenSeadragon from "openseadragon";
import { type ViewerConfigOptions } from "src/context/viewer-context";
import "src/lib/seadragon-svg";

import {
  type LabeledAnnotationedResource,
  type FormattedAnnotationItem,
} from "src/hooks/use-iiif/getAnnotationResources";

export function addOverlaysToViewer(
  viewer: OpenSeadragon.Viewer,
  canvas: CanvasNormalized,
  configOptions: ViewerConfigOptions,
  resources: LabeledAnnotationedResource[],
): void {
  if (!viewer) return;

  const scale = 1 / canvas.width;

  resources.forEach((resource) => {
    resource.items.forEach((item) => {
      if (typeof item.target === "string") {
        if (item.target.includes("#xywh=")) {
          handleXywhString(item, viewer, configOptions, scale);
        }
      } else if (typeof item.target === "object") {
        if (item.target.selector?.type === "PointSelector") {
          handlePointSelector(item, viewer, configOptions, scale);
        } else if (item.target.selector?.type === "SvgSelector") {
          handleSvgSelector(item, viewer, configOptions, scale);
        }
      }
    });
  });
}

function handleXywhString(
  item: FormattedAnnotationItem,
  viewer: OpenSeadragon.Viewer,
  configOptions: ViewerConfigOptions,
  scale: number,
): void {
  const target = item.target as string;
  const parts = target.split("#xywh=");
  if (parts && parts[1]) {
    const [x, y, w, h] = parts[1].split(",").map((value) => Number(value));

    addRectangularOverlay(
      viewer,
      x * scale,
      y * scale,
      w * scale,
      h * scale,
      configOptions,
    );
  }
}

function handlePointSelector(
  item: FormattedAnnotationItem,
  viewer: OpenSeadragon.Viewer,
  configOptions: ViewerConfigOptions,
  scale: number,
): void {
  const x = item.target.selector?.x;
  const y = item.target.selector?.y;

  const svg = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${x}" cy="${y}" r="20" />
    </svg>
  `;

  addSvgOverlay(viewer, svg, configOptions, scale);
}

function handleSvgSelector(
  item: FormattedAnnotationItem,
  viewer: OpenSeadragon.Viewer,
  configOptions: ViewerConfigOptions,
  scale: number,
) {
  const svgString = item.target.selector?.value;

  addSvgOverlay(viewer, svgString, configOptions, scale);
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
    div.className = "annotation-overlay";
  }

  viewer.addOverlay(div, rect);
}

function convertSVGStringToHTML(svgString) {
  if (!svgString) return null;
  const template = document.createElement("template");
  template.innerHTML = svgString.trim();
  const result = template.content.children;

  return result[0];
}

export function addSvgOverlay(
  viewer: any,
  svgString: string,
  configOptions: ViewerConfigOptions,
  scale: number,
) {
  const svgEl = convertSVGStringToHTML(svgString);
  if (svgEl) {
    for (const child of svgEl.children) {
      svg_processChild(viewer, child, configOptions, scale);
    }
  }
}

function svg_processChild(
  viewer: any,
  child: ChildNode,
  configOptions: ViewerConfigOptions,
  scale: number,
) {
  if (child.nodeName === "#text") {
    svg_handleTextNode(child);
  } else {
    const newElement = svg_handleElementNode(child, configOptions, scale);
    viewer.svgOverlay().node().append(newElement);
    viewer.svgOverlay()._svg?.setAttribute("class", "annotation-overlay");

    child.childNodes.forEach((child) => {
      svg_processChild(viewer, child, configOptions, scale);
    });
  }
}

export function svg_handleElementNode(
  child: any,
  configOptions: ViewerConfigOptions,
  scale: number,
) {
  let hasStrokeColor = false;
  let hasStrokeWidth = false;
  let hasFillColor = false;
  let hasFillOpacity = false;

  const newElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    child.nodeName,
  );

  if (child.attributes.length > 0) {
    for (let index = 0; index < child.attributes.length; index++) {
      const element = child.attributes[index];
      switch (element.name) {
        case "fill":
          hasFillColor = true;
          break;
        case "stroke":
          hasStrokeColor = true;
          break;
        case "stroke-width":
          hasStrokeWidth = true;
          break;
        case "fill-opacity":
          hasFillOpacity = true;
          break;
      }
      newElement.setAttribute(element.name, element.textContent);
    }
  }

  if (!hasStrokeColor) {
    newElement.style.stroke = configOptions.annotationOverlays
      ?.borderColor as string;
  }
  if (!hasStrokeWidth) {
    newElement.style.strokeWidth = configOptions.annotationOverlays
      ?.borderWidth as string;
  }
  if (!hasFillColor) {
    newElement.style.fill = configOptions.annotationOverlays
      ?.backgroundColor as string;
  }
  if (!hasFillOpacity) {
    newElement.style.fillOpacity = configOptions.annotationOverlays
      ?.opacity as string;
  }
  newElement.setAttribute("transform", `scale(${scale})`);

  return newElement;
}

function svg_handleTextNode(child: ChildNode) {
  if (!child.textContent) {
    return;
  }
  if (child.textContent.includes("\n")) {
    return;
  }
  console.log(
    "nodeName:",
    child.nodeName,
    ", textContent:",
    child.textContent,
    ", childNodes.length",
    child.childNodes.length,
  );
}
