import type { InternationalString } from "@iiif/presentation-3";
import type {
  BackendKind,
  BackendPreference,
  CameraState,
  CanvasRendererEvent,
  GestureOptions,
  Point,
  Rect,
} from "src/lib/renderer";
import type { CanvasAnnotation } from "src/components/Canvas/Annotations";
import type {
  IIIFCanvas,
  ViewingDirection,
} from "src/components/Canvas/layout";
import type { ControlButtons } from "src/context/viewer-context";
import type { LabeledIIIFExternalWebResource } from "src/types/presentation-3";

/** Which controls to show. All are on by default, as in `Image`. */
export interface CanvasControlsConfig {
  zoom?: boolean;
  fullPage?: boolean;
  rotation?: boolean;
  reset?: boolean;
}

export interface CloverCanvasOptions {
  /** Which painter to use. `auto` (default) tries WebGL2, then Canvas2D. */
  backend?: BackendPreference;
  /** Pointer, wheel and keyboard behaviour. Wheel zoom is off by default. */
  gestures?: Partial<GestureOptions>;
  /** Largest zoom, in CSS pixels per image pixel. Default 1.1. */
  maxZoomPixelRatio?: number;
  /** Smallest zoom, as a fraction of the home zoom. Default 0.9. */
  minZoomImageRatio?: number;
  /** Seconds for an animation to close most of its distance. 0 disables easing. */
  animationTime?: number;
  /**
   * Milliseconds the controls and navigator stay after the pointer stops moving, as the
   * Player's `hideDelay`. Default 2000; `Infinity` keeps them once shown.
   */
  hideDelay?: number;
  /** A time-based Canvas's video or sound. */
  media?: {
    /**
     * How video reaches the screen. `dom` (the default) places a real `<video>` with the
     * camera's transform, so the browser composites it and PiP, AirPlay and HDR keep
     * working. `texture` draws each frame into the canvas with the images, which needs CORS
     * on the media.
     */
    presentation?: "dom" | "texture";
  };
  /** Send cookies with `info.json` and image requests. */
  withCredentials?: boolean;
  /** Extra headers for `info.json` and image requests. These force a CORS preflight. */
  requestHeaders?: Record<string, string>;
}

/**
 * Imperative control over a mounted `Canvas`, handed to `onReady`. Coordinates are world
 * units — the pixels of the first image — so `getBounds()` is directly an `xywh=` region.
 */
export interface CanvasHandle {
  readonly backendKind: BackendKind;
  fitBounds(bounds: Rect, immediate?: boolean): void;
  /** Zoom to a rectangle in image `index`'s own coordinates, padded as `Image` pads. */
  fitItemRect(index: number, rect: Rect, immediate?: boolean): void;
  /** A rectangle in image `index`'s own coordinates, in world units. */
  itemRectToWorld(index: number, rect: Rect): Rect | null;
  getBounds(): Rect;
  getHomeBounds(): Rect | null;
  getCamera(): CameraState;
  home(immediate?: boolean): void;
  zoomBy(factor: number, at?: Point, animate?: boolean): void;
  panBy(dx: number, dy: number, animate?: boolean): void;
  /** Degrees, clockwise. */
  setRotation(degrees: number, immediate?: boolean): void;
  getRotation(): number;
  rotateBy(degrees: number): void;
  worldToScreenPoint(point: Point): Point;
  screenToWorldPoint(point: Point): Point;
  on(
    event: CanvasRendererEvent,
    listener: (detail?: unknown) => void,
  ): () => void;
}

export interface CloverCanvasProps {
  /**
   * IIIF Presentation 3 Canvases to draw: one, or several shown together (a spread). Each
   * Canvas's painting annotations are composed at their targets. Which Canvases to show
   * is the host's decision; `Canvas` steps through nothing itself.
   */
  canvases?: IIIFCanvas[];
  /** How to lay out several Canvases: in reading order along this direction. */
  viewingDirection?: ViewingDirection;
  /** IIIF painting bodies (Image resources). Takes precedence over `src`. */
  body?: LabeledIIIFExternalWebResource | LabeledIIIFExternalWebResource[];
  /** Plain image URLs — or, with `isTiledImage`, image service URIs. */
  src?: string | string[];
  /** Treat each `src` as a IIIF Image API service (its base URI or `info.json`). */
  isTiledImage?: boolean;
  /** Accessible name for the viewport. */
  label?: InternationalString | string;
  /** Stable id for this instance. A new id remounts the renderer. */
  instanceId?: string;
  className?: string;
  options?: CloverCanvasOptions;
  /**
   * Show an overview of the whole image with the visible region outlined; press or drag
   * in it to move there. On by default, as `Image`'s navigator is; never shown for a
   * Canvas of video or sound.
   */
  navigator?: boolean;
  /** Show the control cluster (`true`, the default), none (`false`), or some. */
  controls?: boolean | CanvasControlsConfig;
  /** Replace any control with your own component — the `Viewer`'s `controlButtons`. */
  controlButtons?: ControlButtons;
  /**
   * Annotations to draw as hotspots, as `Image` takes them. Only rectangular (`xywh`)
   * targets are drawn; coordinates are the target image's own.
   */
  annotations?: CanvasAnnotation[];
  /** The hovered or focused annotation's id, or null when none is. */
  onAnnotationActive?: (id: string | null) => void;
  /** Called once, when the first images are laid out and fitted. */
  onReady?: (handle: CanvasHandle) => void;
  /** The visible world rectangle, at most once per frame while the camera moves. */
  onViewportChange?: (bounds: Rect) => void;
  /**
   * A time-based Canvas's media element once it exists, and `null` when it goes: for a
   * host's own transcript, chapters or `#t=` seeks. Sound plays through a `<video>` too.
   */
  onMediaElement?: (element: HTMLVideoElement | null) => void;
  /** Playback reached the end — a host's cue to move to the next Canvas. */
  onEnded?: () => void;
}
