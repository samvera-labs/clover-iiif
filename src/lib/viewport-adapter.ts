import type OpenSeadragon from "openseadragon";

/** A rectangle in the first image's own pixels: an `xywh=` region. */
export interface ViewportRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * What the Viewer needs of its image viewer (OpenSeadragon, through `Image`): zoom to an
 * annotation, read the visible region, follow it as it changes. The information panel,
 * annotation links and content state go through this rather than the OpenSeadragon API.
 *
 * Kept small on purpose. Plugins that reach for `openSeadragonViewer` still find it in
 * the Viewer's state.
 */
export interface ViewportAdapter {
  readonly renderer: "openseadragon";
  /**
   * Zoom to an annotation's hotspot and focus it. False while there is no hotspot for
   * that id yet (the image is still loading), so a caller can try again.
   */
  zoomToAnnotation(id: string): boolean;
  /** The visible region, or null before anything is shown. */
  getVisibleRegion(): ViewportRegion | null;
  /** Called whenever the visible region changes. Returns a function that stops it. */
  onViewportChange(listener: () => void): () => void;
  /** Mark the viewer as showing a content state's target. */
  markContentState(): void;
}

/**
 * Zoom an OpenSeadragon viewer to the overlay drawn for an annotation, padded, and focus
 * it. False while the overlay does not exist yet.
 */
export function zoomToOverlay(
  viewer: OpenSeadragon.Viewer,
  annotationId: string,
): boolean {
  const overlay = viewer.getOverlayById(annotationId);
  if (!overlay || !viewer.viewport) return false;

  // @ts-ignore
  if (overlay.element) overlay.element.focus();
  const bounds = overlay.getBounds(viewer.viewport);
  bounds.x -= 0.2;
  bounds.y -= 0.2;
  bounds.width += 0.5;
  bounds.height += 0.5;
  viewer.viewport.fitBounds(bounds, false);
  return true;
}

const adapters = new WeakMap<OpenSeadragon.Viewer, ViewportAdapter>();

/** The adapter for an OpenSeadragon viewer: one per viewer, so it is stable. */
export function openSeadragonAdapter(
  viewer: OpenSeadragon.Viewer,
): ViewportAdapter {
  const existing = adapters.get(viewer);
  if (existing) return existing;
  const adapter: ViewportAdapter = {
    renderer: "openseadragon",
    zoomToAnnotation: (id) => zoomToOverlay(viewer, id),
    getVisibleRegion() {
      const viewport = viewer.viewport;
      if (!viewport) return null;
      const rect = viewport.viewportToImageRectangle(viewport.getBounds());
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    },
    onViewportChange(listener) {
      const handler = () => listener();
      viewer.addHandler("update-viewport", handler);
      return () => viewer.removeHandler("update-viewport", handler);
    },
    markContentState() {
      viewer.container.className = "clover-iiif-content-state";
    },
  };
  adapters.set(viewer, adapter);
  return adapter;
}

/** An `xywh=` value for a region, rounded to whole pixels. */
export function toXywh({ x, y, width, height }: ViewportRegion): string {
  return `xywh=${[x, y, width, height].map(Math.round).join(",")}`;
}
