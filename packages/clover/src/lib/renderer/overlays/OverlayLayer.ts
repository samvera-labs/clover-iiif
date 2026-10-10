import {
  type CameraState,
  type ViewportSize,
  worldPointToScreen,
} from "../camera/Camera";
import type { Rect } from "../math/rect";

/**
 * Interactive elements pinned to world rectangles — annotation hotspots, chiefly.
 *
 * They stay real, focusable DOM so a reader can tab to them and a screen reader can name
 * them. Each is sized in screen pixels rather than scaled by a transform, so borders and
 * label text stay crisp at every zoom, and turned with the view (OpenSeadragon's `EXACT`
 * overlay rotation).
 */
export class OverlayLayer {
  readonly container: HTMLDivElement;
  private overlays = new Map<HTMLElement, Rect>();

  constructor(parent: HTMLElement) {
    const container = document.createElement("div");
    container.className = "clover-canvas-overlays";
    // Geometry inline: hotspots are placed without the stylesheet too.
    Object.assign(container.style, {
      position: "absolute",
      inset: "0",
      overflow: "hidden",
      pointerEvents: "none",
    });
    parent.appendChild(container);
    this.container = container;
  }

  /** Pin `element` to `rect` (world units). Returns a function that unpins it. */
  add(element: HTMLElement, rect: Rect): () => void {
    this.overlays.set(element, rect);
    element.classList.add("clover-canvas-overlay");
    Object.assign(element.style, {
      position: "absolute",
      top: "0",
      left: "0",
      pointerEvents: "auto",
    });
    if (element.parentElement !== this.container) {
      this.container.appendChild(element);
    }
    return () => {
      this.overlays.delete(element);
    };
  }

  get size(): number {
    return this.overlays.size;
  }

  position(camera: CameraState, viewport: ViewportSize): void {
    const degrees = (camera.rotation * 180) / Math.PI;
    for (const [element, rect] of this.overlays) {
      const center = worldPointToScreen(camera, viewport, {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      });
      const width = rect.width * camera.zoom;
      const height = rect.height * camera.zoom;
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      element.style.transform =
        `translate(${center.x - width / 2}px, ${center.y - height / 2}px)` +
        (degrees ? ` rotate(${degrees}deg)` : "");
    }
  }

  dispose(): void {
    this.overlays.clear();
    this.container.remove();
  }
}
