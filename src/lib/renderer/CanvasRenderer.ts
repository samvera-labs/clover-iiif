import type {
  Backend,
  BackendKind,
  DrawSource,
} from "src/lib/renderer/backends/backend";
import { Canvas2DBackend } from "src/lib/renderer/backends/canvas2d/Canvas2DBackend";
import {
  DomLayers,
  type DomLayerItem,
} from "src/lib/renderer/backends/dom/DomLayers";
import { WebGL2Backend } from "src/lib/renderer/backends/webgl2/WebGL2Backend";
import {
  type CameraState,
  type ViewportSize,
  anchoredCenter,
  fitCamera,
  sameCamera,
  screenPointToWorld,
  visibleWorldRect,
  worldPointToScreen,
} from "src/lib/renderer/camera/Camera";
import { CameraAnimator } from "src/lib/renderer/camera/CameraAnimator";
import {
  DEFAULT_GESTURES,
  GestureController,
  type GestureOptions,
  type GestureTarget,
} from "src/lib/renderer/input/GestureController";
import { TileCache } from "src/lib/renderer/io/TileCache";
import { type LoadedImage, loadImage } from "src/lib/renderer/io/decode";
import { FrameLoop } from "src/lib/renderer/loop/FrameLoop";
import {
  type Point,
  apply,
  compose,
  rotate,
  scale,
} from "src/lib/renderer/math/affine";
import { type Rect, clamp, union } from "src/lib/renderer/math/rect";
import { Navigator } from "src/lib/renderer/overlays/Navigator";
import { OverlayLayer } from "src/lib/renderer/overlays/OverlayLayer";
import { planFrame } from "src/lib/renderer/scene/planFrame";
import {
  type SceneImage,
  type SceneItem,
  MEDIA_KEY_PREFIX,
  layoutItems,
  pixelsToWorld,
  prepareItem,
  sameSpec,
} from "src/lib/renderer/scene/sceneItem";

export type { SceneImage } from "src/lib/renderer/scene/sceneItem";

export type BackendPreference = "auto" | BackendKind;

export interface CanvasRendererOptions {
  /** Which painter to use. `auto` tries WebGL2, then Canvas2D. */
  backend?: BackendPreference;
  gestures?: Partial<GestureOptions>;
  /** Largest zoom, in CSS pixels per image pixel (OpenSeadragon's `maxZoomPixelRatio`). */
  maxZoomPixelRatio?: number;
  /** Smallest zoom, as a fraction of the home zoom (OpenSeadragon's `minZoomImageRatio`). */
  minZoomImageRatio?: number;
  /** Fraction of the viewport left clear around the home view. */
  homePadding?: number;
  /** Seconds for an animation to close most of its distance. 0 disables animation. */
  animationTime?: number;
  /** Send cookies with `info.json` and image requests. */
  withCredentials?: boolean;
  /** Extra headers for `info.json` and image requests (these force a CORS preflight). */
  requestHeaders?: Record<string, string>;
  /** Decoded tile bytes to keep in memory. */
  byteBudget?: number;
  /** Image requests in flight at once. */
  maxInFlight?: number;
  /** Milliseconds offscreen before a WebGL context is released. */
  releaseAfterMs?: number;
}

export type CanvasRendererEvent =
  /** The first set of images is laid out and fitted. Fires once. */
  | "open"
  /** The camera moved. Fires at most once per frame. */
  | "viewport"
  /** A new set of images replaced the previous one. */
  | "change"
  | "error"
  /** The backend changed (fallback, or a context released and reacquired). */
  | "backend"
  /** A click that is not a zoom, with click-to-zoom turned off. */
  | "tap";

type Listener = (detail?: unknown) => void;

const DEFAULTS = {
  maxZoomPixelRatio: 1.1,
  minZoomImageRatio: 0.9,
  homePadding: 0,
  animationTime: 0.09,
  withCredentials: false,
  requestHeaders: {} as Record<string, string>,
  byteBudget: 192 * 1024 * 1024,
  maxInFlight: 6,
  releaseAfterMs: 2000,
};

/** Retina is plenty: above 2, fill-rate and memory grow faster than anyone can see. */
const MAX_PIXEL_RATIO = 2;
/** Context losses tolerated before the renderer gives up on WebGL for this instance. */
const MAX_CONTEXT_LOSSES = 3;
/** Padding around an annotation zoomed to, as a fraction of the first item's width. */
const ANNOTATION_PADDING = 0.1;

/**
 * Clover's 2D renderer: one camera over a scene of images, each a pyramid of tiles.
 *
 * Every frame is planned (`planFrame`: which tiles to draw, which to fetch), handed to
 * the tile cache, and painted by a backend — with DOM layers for pixels the backend may
 * not read, an overlay layer for annotation hotspots, and an optional navigator.
 *
 * Framework-free — the React `Canvas` component is a thin host around it — so it can be
 * driven, measured and tested on its own.
 */
export class CanvasRenderer implements GestureTarget {
  readonly host: HTMLElement;
  /** Annotation hotspots and anything else pinned to a world rectangle. */
  readonly overlays: OverlayLayer;

  private options: typeof DEFAULTS;
  private backend: Backend | null = null;
  private backendPreference: BackendPreference;
  private contextLosses = 0;
  private dom: DomLayers;
  private camera: CameraAnimator;
  private loop: FrameLoop;
  private gestures: GestureController;
  /** The gesture options the renderer was created with; `setGestures` layers on these. */
  private gestureOptions: Partial<GestureOptions> = {};
  private cache: TileCache;
  private navigator: Navigator | null = null;

  private viewport: ViewportSize = { width: 1, height: 1 };
  private pixelRatio = 1;
  private items: SceneItem[] = [];
  private worldBounds: Rect | null = null;
  /** Bumped when the scene or its loaded tiles change: the navigator redraws on it. */
  private contentVersion = 0;
  /** Tiles WebGL refused (no CORS): shown as DOM layers from then on. */
  private opaqueUrls = new Set<string>();
  /** Media items' elements, by their one tile's key. Never in the tile cache. */
  private mediaByKey = new Map<string, LoadedImage>();
  /**
   * Each video element's decoded-frame count, where `requestVideoFrameCallback` reports
   * one: a drawn video re-uploads only when it changes, not on every display frame.
   */
  private mediaFrames = new Map<HTMLVideoElement, number>();
  private detachMedia: Array<() => void> = [];
  private opened = false;
  /** True until the reader moves the camera; a resize then refits rather than crops. */
  private atHome = true;
  private lastEmitted: CameraState | null = null;
  private generation = 0;
  private listeners = new Map<CanvasRendererEvent, Set<Listener>>();

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private releaseTimer: ReturnType<typeof setTimeout> | null = null;
  private dprQuery: MediaQueryList | null = null;
  private disposed = false;

  constructor(host: HTMLElement, options: CanvasRendererOptions = {}) {
    this.host = host;
    this.backendPreference = options.backend ?? "auto";
    this.options = {
      ...DEFAULTS,
      ...stripUndefined(options),
    } as typeof DEFAULTS;
    if (prefersReducedMotion()) this.options.animationTime = 0;

    this.dom = new DomLayers(host);
    this.overlays = new OverlayLayer(host);
    this.camera = new CameraAnimator(
      { x: 0, y: 0, zoom: 1, rotation: 0 },
      this.options.animationTime,
    );
    this.loop = new FrameLoop(this.tick);
    this.gestureOptions = stripUndefined(options.gestures ?? {});
    this.gestures = new GestureController(host, this, {
      ...DEFAULT_GESTURES,
      ...this.gestureOptions,
    });
    this.cache = new TileCache({
      load: (url, signal) => this.loadTile(url, signal),
      onSettled: () => {
        this.contentVersion++;
        this.invalidate();
      },
      onEvict: (url) => this.backend?.release(url),
      byteBudget: this.options.byteBudget,
      maxInFlight: this.options.maxInFlight,
    });

    this.acquireBackend();
    this.measure();
    this.observe();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  get backendKind(): BackendKind {
    return this.backend?.kind ?? "none";
  }

  get isOpen(): boolean {
    return this.opened;
  }

  on(event: CanvasRendererEvent, listener: Listener): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);
    return () => set?.delete(listener);
  }

  /**
   * Replace the scene.
   *
   * New items are resolved — `info.json` fetched, coarsest tiles decoded — before they
   * replace the old ones, so a swap never flashes empty. Items whose description is
   * unchanged are kept as they are, and tiles are cached by URL, so swapping between two
   * regions of one image costs nothing at all.
   */
  async setImages(
    images: SceneImage[],
    {
      world,
      fit = false,
    }: {
      /**
       * The world's extent, when it is more than the images cover — the Canvases they are
       * painted on, which may have bare areas. Home frames this.
       */
      world?: Rect;
      /** Frame the new scene rather than keep the reader's view (a new page). */
      fit?: boolean;
    } = {},
  ): Promise<void> {
    const generation = ++this.generation;
    const previous = new Map(this.items.map((item) => [item.id, item]));

    const results = await Promise.allSettled(
      images.map((spec) => {
        const kept = previous.get(spec.id);
        if (kept && sameSpec(kept.spec, spec)) return Promise.resolve(kept);
        return prepareItem(spec, {
          cache: this.cache,
          loadStatic: (url) => this.loadTile(url),
          infoOptions: {
            withCredentials: this.options.withCredentials,
            headers: this.options.requestHeaders,
          },
        });
      }),
    );

    // Superseded by a later call, or torn down while loading.
    if (generation !== this.generation || this.disposed) return;

    const items = results
      .filter(
        (r): r is PromiseFulfilledResult<SceneItem> => r.status === "fulfilled",
      )
      .map((r) => r.value);
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => r.reason);

    this.items = items;
    this.watchMedia(items);
    const laidOut = layoutItems(items);
    this.worldBounds = world
      ? laidOut
        ? union([world, laidOut])
        : world
      : laidOut;
    this.contentVersion++;

    if (errors.length) this.emit("error", errors);

    if (!this.worldBounds) {
      this.invalidate();
      return;
    }

    if (!this.opened) {
      this.opened = true;
      this.home(true);
      this.emit("open");
    } else if (fit) {
      this.home(true);
      this.emit("change");
    } else {
      // Preserve the reader's view across swaps; only re-apply limits.
      this.camera.set(this.constrain(this.camera.current));
      this.emit("change");
    }
    this.invalidate();
  }

  /** Frame `bounds` (world units) in the viewport. */
  fitBounds(bounds: Rect, immediate = false): void {
    const target = fitCamera(
      bounds,
      this.viewport,
      this.camera.destination.rotation,
      0,
    );
    this.atHome = false;
    this.animateTo(
      this.constrain(target, { allowBeyondLimits: true }),
      immediate,
    );
  }

  /**
   * Zoom to a rectangle in item `index`'s own coordinates — an annotation's `xywh` — with
   * OpenSeadragon's padding.
   */
  fitItemRect(index: number, rect: Rect, immediate = false): void {
    const world = this.itemRectToWorld(index, rect);
    if (world) this.fitAnnotation(world, immediate);
  }

  /** Zoom to a world rectangle with OpenSeadragon's annotation padding. */
  fitAnnotation(world: Rect, immediate = false): void {
    const first = this.items[0];
    if (!first) return;
    const pad = first.rect.width * ANNOTATION_PADDING;
    this.fitBounds(
      {
        x: world.x - pad,
        y: world.y - pad,
        width: world.width + pad * 2,
        height: world.height + pad * 2,
      },
      immediate,
    );
  }

  /** The world rectangle currently visible (its bounding box when rotated). */
  getBounds(): Rect {
    return visibleWorldRect(this.camera.current, this.viewport);
  }

  getHomeBounds(): Rect | null {
    return this.worldBounds ? { ...this.worldBounds } : null;
  }

  getCamera(): CameraState {
    return { ...this.camera.current };
  }

  getZoomLimits(): { min: number; max: number; home: number } {
    const home = this.homeCamera()?.zoom ?? 1;
    /*
     * maxZoomPixelRatio is CSS pixels per *image* pixel, and world units may differ from
     * those. Measured against the sharpest image in the scene, so an inset photograph
     * denser than the page it sits on can still be zoomed to its own full resolution.
     */
    const worldPerPixel = this.items.length
      ? Math.min(...this.items.map((item) => pixelsToWorld(item).x))
      : 1;
    return {
      home,
      min: home * this.options.minZoomImageRatio,
      max: Math.max(home, this.options.maxZoomPixelRatio / worldPerPixel),
    };
  }

  home(immediate = false): void {
    const home = this.homeCamera();
    if (!home) return;
    this.atHome = true;
    this.animateTo(home, immediate);
  }

  zoomBy(factor: number, at?: Point, animate = true): void {
    const base = animate ? this.camera.destination : this.camera.current;
    const screen = at ?? {
      x: this.viewport.width / 2,
      y: this.viewport.height / 2,
    };
    const world = screenPointToWorld(base, this.viewport, screen);
    const { min, max } = this.getZoomLimits();
    const zoom = clamp(base.zoom * factor, min, max);
    const center = anchoredCenter(
      world,
      screen,
      zoom,
      base.rotation,
      this.viewport,
    );
    const target = this.constrain({ ...base, ...center, zoom });
    this.atHome = false;
    if (animate) {
      this.camera.animateTo(
        { state: target, anchor: { world, screen } },
        this.viewport,
      );
    } else {
      this.camera.set(target);
    }
    this.invalidate();
  }

  panBy(dx: number, dy: number, animate = false): void {
    const base = animate ? this.camera.destination : this.camera.current;
    // A screen-space shift, carried back through the camera's rotation and zoom.
    const shift = apply(compose(scale(1 / base.zoom), rotate(-base.rotation)), {
      x: dx,
      y: dy,
    });
    const target = this.constrain({
      ...base,
      x: base.x - shift.x,
      y: base.y - shift.y,
    });
    this.atHome = false;
    if (animate) this.camera.animateTo({ state: target }, this.viewport);
    else this.camera.set(target);
    this.invalidate();
  }

  /** Centre the view on a world point. */
  panTo(point: Point, immediate = false): void {
    const base = immediate ? this.camera.current : this.camera.destination;
    this.atHome = false;
    this.animateTo(this.constrain({ ...base, ...point }), immediate);
  }

  flick(vx: number, vy: number): void {
    // Glide the distance the release velocity would cover in a quarter second.
    this.panBy(vx * 0.25, vy * 0.25, true);
  }

  rotateBy(degrees: number): void {
    const base = this.camera.destination;
    this.setRotation((base.rotation * 180) / Math.PI + degrees);
  }

  /** Rotate about the viewport centre. Degrees, clockwise, like OpenSeadragon. */
  setRotation(degrees: number, immediate = false): void {
    const base = this.camera.destination;
    const rotation = (degrees * Math.PI) / 180;
    this.animateTo(this.constrain({ ...base, rotation }), immediate);
  }

  getRotation(): number {
    return (this.camera.destination.rotation * 180) / Math.PI;
  }

  tap(at: Point): void {
    this.emit("tap", at);
  }

  /** Change how pointer, wheel and keyboard drive the camera. */
  setGestures(gestures: Partial<GestureOptions>): void {
    this.gestures.setOptions({
      ...DEFAULT_GESTURES,
      ...this.gestureOptions,
      ...stripUndefined(gestures),
    });
  }

  setInteracting(interacting: boolean): void {
    // A pointer is down: the camera tracks it 1:1, so cancel any animation in flight.
    if (interacting) this.camera.stop();
  }

  worldToScreenPoint(point: Point): Point {
    return worldPointToScreen(this.camera.current, this.viewport, point);
  }

  screenToWorldPoint(point: Point): Point {
    return screenPointToWorld(this.camera.current, this.viewport, point);
  }

  /** Where item `index` sits in the world. */
  getItemRect(index: number): Rect | null {
    const item = this.items[index];
    return item ? { ...item.rect } : null;
  }

  get itemCount(): number {
    return this.items.length;
  }

  /**
   * A rectangle in item `index`'s own coordinates (its declared size — what an
   * annotation's `xywh` targets) → world units.
   */
  itemRectToWorld(index: number, rect: Rect): Rect | null {
    const item = this.items[index];
    if (!item) return null;
    const { contentClip } = item;
    const kx = item.rect.width / contentClip.width;
    const ky = item.rect.height / contentClip.height;
    return {
      x: item.rect.x + (rect.x - contentClip.x) * kx,
      y: item.rect.y + (rect.y - contentClip.y) * ky,
      width: rect.width * kx,
      height: rect.height * ky,
    };
  }

  /** Show an overview of the scene in `element`. Returns a function that removes it. */
  attachNavigator(element: HTMLElement): () => void {
    this.navigator?.dispose();
    const navigator = new Navigator(element, (point, immediate) =>
      this.panTo(point, immediate),
    );
    this.navigator = navigator;
    this.invalidate();
    return () => {
      navigator.dispose();
      if (this.navigator === navigator) this.navigator = null;
    };
  }

  /** Diagnostics: what the tile cache holds and is fetching. */
  getStats(): { tileBytes: number; pending: number; backend: BackendKind } {
    return {
      tileBytes: this.cache.byteSize,
      pending: this.cache.pending,
      backend: this.backendKind,
    };
  }

  invalidate(): void {
    this.loop.invalidate();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    this.loop.dispose();
    this.gestures.dispose();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.dprQuery?.removeEventListener?.("change", this.onPixelRatioChange);
    if (this.releaseTimer) clearTimeout(this.releaseTimer);
    this.navigator?.dispose();
    this.navigator = null;
    this.releaseBackend();
    this.cache.dispose();
    this.dom.dispose();
    this.overlays.dispose();
    this.items = [];
    this.detachMedia.forEach((detach) => detach());
    this.mediaByKey.clear();
    this.listeners.clear();
    delete this.host.dataset.backend;
  }

  // ─── Frame ────────────────────────────────────────────────────────────────

  private tick = (dt: number): boolean => {
    if (this.disposed) return false;
    const animating = this.camera.step(dt, this.viewport);
    const camera = this.camera.current;

    const plan = planFrame({
      items: this.items,
      camera,
      viewport: this.viewport,
      pixelRatio: this.pixelRatio,
      getTile: this.getTile,
      wantOverview: Boolean(this.navigator),
    });
    this.cache.update(
      plan.wants.filter((want) => !want.url.startsWith(MEDIA_KEY_PREFIX)),
    );
    this.paint(plan.draws);
    this.overlays.position(camera, this.viewport);
    this.navigator?.render(
      this.items,
      this.worldBounds,
      visibleWorldRect(camera, this.viewport),
      this.pixelRatio,
      this.getTile,
      this.contentVersion,
    );

    if (!this.lastEmitted || !sameCamera(this.lastEmitted, camera)) {
      this.lastEmitted = { ...camera };
      if (this.opened) this.emit("viewport");
    }
    // A video drawn into the canvas needs a frame per display frame while it plays.
    return animating || this.texturePlaying();
  };

  private getTile = (url: string) =>
    this.mediaByKey.get(url) ?? this.cache.get(url);

  /** A drawn video playing without frame callbacks: poll it every display frame. */
  private texturePlaying(): boolean {
    for (const media of this.mediaByKey.values()) {
      if (
        media.kind === "media" &&
        !media.opaque &&
        !media.source.paused &&
        !this.mediaFrames.has(media.source)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Track the scene's media elements: redraw when one has a new frame to show (it
   * started, seeked, or loaded), and drop the listeners when the scene changes.
   */
  private watchMedia(items: SceneItem[]): void {
    this.detachMedia.forEach((detach) => detach());
    this.detachMedia = [];
    this.mediaByKey.clear();
    for (const item of items) {
      if (!item.media || item.media.kind !== "media") continue;
      const key = item.pyramid.tile({ level: 0, col: 0, row: 0 }).url;
      this.mediaByKey.set(key, item.media);
      const element = item.media.source;
      const redraw = () => this.invalidate();
      const events = ["play", "seeked", "loadeddata", "resize"];
      events.forEach((type) => element.addEventListener(type, redraw));
      this.detachMedia.push(() =>
        events.forEach((type) => element.removeEventListener(type, redraw)),
      );
      if (!item.media.opaque && "requestVideoFrameCallback" in element) {
        // Redraw once per decoded frame, at the frame's own rate.
        this.mediaFrames.set(element, 0);
        let handle = 0;
        const onFrame = () => {
          this.mediaFrames.set(
            element,
            (this.mediaFrames.get(element) ?? 0) + 1,
          );
          this.invalidate();
          handle = element.requestVideoFrameCallback(onFrame);
        };
        handle = element.requestVideoFrameCallback(onFrame);
        this.detachMedia.push(() => {
          element.cancelVideoFrameCallback(handle);
          this.mediaFrames.delete(element);
        });
      }
    }
  }

  private paint(draws: ReturnType<typeof planFrame>["draws"]): void {
    const backend = this.backend;
    const domItems: DomLayerItem[] = [];
    const webgl = backend?.kind === "webgl2";

    backend?.begin();
    for (const draw of draws) {
      const { image } = draw;
      /*
       * DOM layers: video presented as a `<video>` (the default) whatever the backend,
       * and anything WebGL may not read.
       */
      const asDom =
        image.kind === "media"
          ? image.opaque || this.opaqueUrls.has(draw.url)
          : image.kind === "element" &&
            webgl &&
            (image.opaque || this.opaqueUrls.has(draw.url));

      if (!asDom && backend) {
        const result = backend.draw({
          key: draw.url,
          source: image.source as DrawSource,
          width: image.width,
          height: image.height,
          transform: draw.transform,
          crop: draw.crop,
          opacity: 1,
          bleed: draw.bleed,
          // A video re-uploads as its frame changes; a still image uploads once.
          version:
            image.kind === "media"
              ? (this.mediaFrames.get(image.source) ??
                Math.round(image.source.currentTime * 1000))
              : undefined,
        });
        if (result !== "tainted" || image.kind === "bitmap") continue;
        // WebGL may not read these pixels. Show the element itself from now on.
        this.opaqueUrls.add(draw.url);
      }

      if (image.kind === "element" || image.kind === "media") {
        domItems.push({
          key: `${draw.item.id}|${draw.url}`,
          element: image.source,
          width: image.width,
          height: image.height,
          transform: draw.transform,
          crop: draw.crop,
          opacity: 1,
        });
      }
    }
    backend?.end();
    this.dom.sync(domItems);
  }

  private loadTile(url: string, signal?: AbortSignal) {
    return loadImage(url, {
      signal,
      withCredentials: this.options.withCredentials,
      headers: this.options.requestHeaders,
      maxTextureSize:
        this.backend instanceof WebGL2Backend
          ? this.backend.maxTextureSize
          : undefined,
    });
  }

  // ─── Camera helpers ───────────────────────────────────────────────────────

  private animateTo(state: CameraState, immediate: boolean): void {
    this.camera.animateTo({ state }, this.viewport, immediate);
    this.invalidate();
  }

  /** Home is the whole world, upright — Clover's home control also resets rotation. */
  private homeCamera(): CameraState | null {
    if (!this.worldBounds) return null;
    return fitCamera(
      this.worldBounds,
      this.viewport,
      0,
      this.options.homePadding,
    );
  }

  /**
   * Keep the camera usable: zoom within limits, and the centre over the world so the
   * picture cannot be flung out of sight.
   */
  private constrain(
    state: CameraState,
    { allowBeyondLimits = false } = {},
  ): CameraState {
    const bounds = this.worldBounds;
    if (!bounds) return state;
    const { min, max } = this.getZoomLimits();
    const zoom = allowBeyondLimits
      ? clamp(state.zoom, min, Math.max(max, state.zoom))
      : clamp(state.zoom, min, max);
    return {
      ...state,
      zoom,
      x: clamp(state.x, bounds.x, bounds.x + bounds.width),
      y: clamp(state.y, bounds.y, bounds.y + bounds.height),
    };
  }

  // ─── Backend lifecycle ────────────────────────────────────────────────────

  private acquireBackend(): void {
    if (this.backend || this.disposed) return;

    const canvas = document.createElement("canvas");
    canvas.className = "clover-canvas-surface";
    canvas.setAttribute("aria-hidden", "true");
    this.host.insertBefore(canvas, this.dom.container);

    const tryWebGL =
      this.backendPreference === "webgl2" ||
      (this.backendPreference === "auto" &&
        this.contextLosses < MAX_CONTEXT_LOSSES);

    let backend: Backend | null = null;
    if (tryWebGL) {
      backend = WebGL2Backend.create(canvas, {
        onLost: this.onContextLost,
        onRestored: this.onContextRestored,
      });
    }
    if (!backend && this.backendPreference !== "webgl2") {
      backend = Canvas2DBackend.create(canvas);
    }

    if (!backend) {
      canvas.remove();
      this.host.dataset.backend = "none";
      return;
    }

    this.backend = backend;
    this.host.dataset.backend = backend.kind;
    backend.resize(this.viewport.width, this.viewport.height, this.pixelRatio);

    // Tiles demoted to DOM only because WebGL refused them can go back on the canvas
    // under a backend that will draw them.
    if (backend.kind === "canvas2d") this.opaqueUrls.clear();

    this.emit("backend", backend.kind);
    this.invalidate();
  }

  private releaseBackend(): void {
    if (!this.backend) return;
    const canvas = this.backend.canvas;
    this.backend.dispose();
    canvas.remove();
    this.backend = null;
  }

  private onContextLost = () => {
    this.contextLosses += 1;
    if (
      this.contextLosses >= MAX_CONTEXT_LOSSES &&
      this.backendPreference === "auto"
    ) {
      // A GPU that keeps dropping us: settle on Canvas2D for this instance.
      this.releaseBackend();
      this.acquireBackend();
    }
  };

  private onContextRestored = () => {
    // Textures went with the context; the next frame re-uploads from decoded pixels.
    this.invalidate();
  };

  // ─── Observation ──────────────────────────────────────────────────────────

  private observe(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(this.host);
    }

    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        this.setVisible(visible);
      });
      this.intersectionObserver.observe(this.host);
    }

    this.watchPixelRatio();
  }

  /**
   * Browsers cap live WebGL contexts per page and silently kill the oldest beyond it.
   * An instance scrolled out of view gives its context back after a grace period and
   * takes a fresh one on return; decoded tiles stay in memory, so nothing is refetched.
   */
  private setVisible(visible: boolean): void {
    if (visible) {
      if (this.releaseTimer) clearTimeout(this.releaseTimer);
      this.releaseTimer = null;
      if (!this.backend) this.acquireBackend();
      return;
    }
    if (this.backend?.kind !== "webgl2" || this.releaseTimer) return;
    this.releaseTimer = setTimeout(() => {
      this.releaseTimer = null;
      this.releaseBackend();
      this.host.dataset.backend = "released";
    }, this.options.releaseAfterMs);
  }

  private measure(): void {
    const rect = this.host.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const pixelRatio = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      MAX_PIXEL_RATIO,
    );
    if (
      width === this.viewport.width &&
      height === this.viewport.height &&
      pixelRatio === this.pixelRatio
    ) {
      return;
    }

    const previous = this.viewport;
    this.viewport = { width, height };
    this.pixelRatio = pixelRatio;
    this.backend?.resize(width, height, pixelRatio);

    if (this.opened) {
      if (this.atHome) {
        this.home(true);
      } else {
        // Keep the same world width in view as the stage resizes.
        const current = this.camera.current;
        const ratio = width / Math.max(previous.width, 1);
        this.camera.set(
          this.constrain({ ...current, zoom: current.zoom * ratio }),
        );
      }
    }
    this.invalidate();
  }

  private watchPixelRatio(): void {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    this.dprQuery?.removeEventListener?.("change", this.onPixelRatioChange);
    this.dprQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    this.dprQuery.addEventListener?.("change", this.onPixelRatioChange);
  }

  private onPixelRatioChange = () => {
    this.measure();
    this.watchPixelRatio();
  };

  private emit(event: CanvasRendererEvent, detail?: unknown): void {
    this.listeners.get(event)?.forEach((listener) => listener(detail));
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
