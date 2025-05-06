import {
  Annotation,
  AnnotationNormalized,
  IIIFExternalWebResource,
  type CanvasNormalized,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import OpenSeadragon from "openseadragon";
import {
  type OverlayOptions,
  type ViewerConfigOptions,
} from "src/context/viewer-context";
import { OsdSvgOverlay } from "src/lib/openseadragon-svg";
import { parseAnnotationTarget } from "src/lib/annotation-helpers";

import { ParsedAnnotationTarget } from "src/types/annotations";
import { getImageServiceURI } from "src/lib/iiif";
import { OpenSeadragonImageTypes } from "src/types/open-seadragon";

export function addOverlaysToViewer(
  viewer: OpenSeadragon.Viewer,
  canvas: CanvasNormalized,
  configOptions: OverlayOptions,
  annotations: Annotation[] | AnnotationNormalized[],
  overlaySelector: string,
): void {
  if (!viewer) return;

  const scale = 1 / canvas.width;

  annotations.forEach((annotation) => {
    if (!annotation.target) return;

    const parsedAnnotationTarget = parseAnnotationTarget(annotation.target);
    const { point, rect, svg } = parsedAnnotationTarget;

    if (rect) {
      const { x, y, w, h } = rect;
      addRectangularOverlay(
        viewer,
        x * scale,
        y * scale,
        w * scale,
        h * scale,
        configOptions,
        overlaySelector,
      );
    }

    if (point) {
      const { x, y } = point;
      const svg = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${x}" cy="${y}" r="20" />
        </svg>
      `;

      addSvgOverlay(viewer, svg, configOptions, scale, overlaySelector);
    }

    if (svg) {
      addSvgOverlay(viewer, svg, configOptions, scale, overlaySelector);
    }
  });
}

export function createOpenSeadragonRect(
  canvas: CanvasNormalized,
  parsedAnnotationTarget: ParsedAnnotationTarget,
  zoomLevel: number,
) {
  let x,
    y,
    w = 40,
    h = 40;

  if (parsedAnnotationTarget.rect) {
    x = parsedAnnotationTarget.rect.x;
    y = parsedAnnotationTarget.rect.y;
    w = parsedAnnotationTarget.rect.w;
    h = parsedAnnotationTarget.rect.h;
  }

  if (parsedAnnotationTarget.point) {
    x = parsedAnnotationTarget.point.x;
    y = parsedAnnotationTarget.point.y;
  }

  // TODO: How to handle SVG where no rect or point exists?
  // @ts-ignore
  if (parseAnnotationTarget.svg) {
  }

  const scale = 1 / canvas.width;
  const rect = new OpenSeadragon.Rect(
    x * scale - ((w * scale) / 2) * (zoomLevel - 1),
    y * scale - ((h * scale) / 2) * (zoomLevel - 1),
    w * scale * zoomLevel,
    h * scale * zoomLevel,
  );

  return rect;
}

/**
 * Add a rectangular overlay to an OpenSeadragon viewer
 */
export function addRectangularOverlay(
  viewer: OpenSeadragon.Viewer,
  x: number,
  y: number,
  w: number,
  h: number,
  configOptions: OverlayOptions,
  overlaySelector: string,
): void {
  const rect = new OpenSeadragon.Rect(x, y, w, h);
  const div = document.createElement("div");

  if (configOptions) {
    const { backgroundColor, opacity, borderType, borderColor, borderWidth } =
      configOptions;

    div.style.backgroundColor = backgroundColor as string;
    div.style.opacity = opacity as string;
    div.style.border = `${borderType} ${borderWidth} ${borderColor}`;
    div.className = overlaySelector;
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
  configOptions: OverlayOptions,
  scale: number,
  overlaySelector: string,
) {
  const svgEl = convertSVGStringToHTML(svgString);
  if (svgEl) {
    for (const child of svgEl.children) {
      svg_processChild(viewer, child, configOptions, scale, overlaySelector);
    }
  }
}

function svg_processChild(
  viewer: any,
  child: ChildNode,
  configOptions: OverlayOptions,
  scale: number,
  overlaySelector: string,
) {
  if (child.nodeName === "#text") {
    svg_handleTextNode(child);
  } else {
    const newElement = svg_handleElementNode(child, configOptions, scale);
    const overlay = OsdSvgOverlay(viewer);
    overlay.node().append(newElement);
    overlay._svg?.setAttribute("class", overlaySelector);

    // BUG: svg with children elements aren't formated correctly.
    child.childNodes.forEach((child) => {
      svg_processChild(viewer, child, configOptions, scale, overlaySelector);
    });
  }
}

export function svg_handleElementNode(
  child: any,
  configOptions: OverlayOptions,
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
    newElement.style.stroke = configOptions?.borderColor as string;
  }
  if (!hasStrokeWidth) {
    newElement.style.strokeWidth = configOptions?.borderWidth as string;
  }
  if (!hasFillColor) {
    newElement.style.fill = configOptions?.backgroundColor as string;
  }
  if (!hasFillOpacity) {
    newElement.style.fillOpacity = configOptions?.opacity as string;
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

export const parseImageBody = (body: IIIFExternalWebResource) => {
  const hasImageService =
    Array.isArray(body?.service) && body?.service.length > 0;

  const uri = hasImageService ? getImageServiceURI(body?.service) : body?.id;
  const imageType: OpenSeadragonImageTypes = hasImageService
    ? OpenSeadragonImageTypes.TiledImage
    : OpenSeadragonImageTypes.SimpleImage;

  return {
    uri,
    imageType,
  };
};

export const parseSrc = (src: string, isTiledImage: boolean) => {
  const imageType = isTiledImage
    ? OpenSeadragonImageTypes.TiledImage
    : OpenSeadragonImageTypes.SimpleImage;

  return {
    uri: src,
    imageType,
  };
};

export function removeOverlaysFromViewer(
  viewer: OpenSeadragon.Viewer,
  overlaySelector: string,
) {
  if (!viewer) return;

  if (!overlaySelector.startsWith(".")) {
    overlaySelector = "." + overlaySelector;
  }
  const elements = document.querySelectorAll(overlaySelector);
  if (elements) {
    elements.forEach((element) => viewer.removeOverlay(element));
  }
}

export function panToTarget(openSeadragonViewer, zoomLevel, target, canvas) {
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

export function addContentSearchOverlays(
  vault: any,
  contentSearch: AnnotationPageNormalized,
  openSeadragonViewer,
  canvas: CanvasNormalized,
  configOptions: ViewerConfigOptions,
) {
  if (!contentSearch?.items) return;
  if (contentSearch?.items.length === 0) return;

  const annotations: Array<AnnotationNormalized> = [];
  contentSearch.items.forEach((item) => {
    const annotation = vault.get(item.id) as AnnotationNormalized;

    if (typeof annotation.target === "string") {
      if (annotation.target.startsWith(canvas.id)) {
        annotations.push(annotation as unknown as AnnotationNormalized);
      }
    }
  });

  if (openSeadragonViewer && configOptions.contentSearch?.overlays) {
    addOverlaysToViewer(
      openSeadragonViewer,
      canvas,
      configOptions.contentSearch.overlays,
      annotations,
      "content-search-overlay",
    );
  }
}

export const handleSelectorZoom = (
  selector: any,
  openSeadragonViewer: any,
  canvas: CanvasNormalized,
  configOptions: ViewerConfigOptions,
) => {
  if (!openSeadragonViewer || !selector || !canvas) return;

  // Build target based on selector type
  let target;
  if (selector.type === "FragmentSelector" && selector.value) {
    target = `${canvas.id}#${selector.value}`;
  } else if (selector.type === "PointSelector") {
    target = {
      source: canvas.id,
      selector: {
        type: "PointSelector",
        x: selector.x,
        y: selector.y,
      },
    };
  } else if (selector.type === "SvgSelector") {
    target = {
      source: canvas.id,
      selector: {
        type: "SvgSelector",
        value: selector.value,
      },
    };
  }

  if (!target) return;

  const parsedTarget = parseAnnotationTarget(target);
  if (!parsedTarget) return;

  const zoomLevel = configOptions?.annotationOverlays?.zoomLevel || 2;
  const rect = createOpenSeadragonRect(canvas, parsedTarget, zoomLevel);

  if (rect) {
    openSeadragonViewer.viewport.fitBounds(rect);
  }
};
