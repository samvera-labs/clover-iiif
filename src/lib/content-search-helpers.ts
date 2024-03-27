import { parseAnnotationTarget } from "src/lib/annotation-helpers";
import { createOpenSeadragonRect } from "src/lib/openseadragon-helpers";

export function panToTarget(
  openSeadragonViewer,
  configOptions,
  target,
  canvas,
) {
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
