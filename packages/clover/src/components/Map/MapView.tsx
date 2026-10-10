import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_STYLE_URL, applyDefaultBasemap } from "./basemap";
import {
  type Georeference,
  type MapFeature,
  type MapFeatureCollection,
  boundsOf,
  cornersOf,
  georeferencesOf,
  navPlaceOf,
  overlayImageUrl,
  readGeoreference,
} from "../../core/geo";
import type { IIIFContent } from "../../core/load";
import { type CloverRequest, sendsCredentials } from "../../core/request";
import { selectVisibleCanvases } from "../../core/selectors";
import { useCloverTranslation } from "../../i18n/useCloverTranslation";
import { join } from "../../lib/classnames";
import {
  useOptionalClover,
  useOptionalCloverSelector,
} from "../../react/context";
import { getMapWorkerUrl } from "../../core/map-config";

export interface MapProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /**
   * Standalone: a IIIF resource (URL or object) to map: its navPlace, and its Canvases'
   * georeferenced images. Inside a `Root`, leave it out to map the Root's.
   */
  iiifContent?: IIIFContent;
  /** GeoJSON to draw (a FeatureCollection, Feature or geometry), as navPlace is. */
  navPlace?: unknown;
  /** Georeference Extension annotations to overlay, on a Canvas or an image service. */
  georeferences?: unknown[];
  /** Draw georeferenced images over the basemap. Default true. */
  overlay?: boolean;
  /** The overlays' opacity, 0 to 1. Default 0.75. */
  overlayOpacity?: number;
  /** A MapLibre style URL, used as it is. Default: Clover's relief basemap (OpenFreeMap). */
  styleUrl?: string;
  /**
   * Where MapLibre's worker is served from, if your bundler moves MapLibre's files (see
   * the Map docs). By default MapLibre finds its own.
   */
  workerUrl?: string;
  /** Zoom with the wheel or trackpad. Default false, so an embedded map never traps page scroll. */
  scrollZoom?: boolean;
  /** A place was chosen. Inside a `Root`, choosing one on a Canvas also goes there. */
  onSelect?: (feature: MapFeature) => void;
  /** Standalone: credentials, headers and `fetch`. */
  request?: CloverRequest;
  /** Standalone: the language to read IIIF text in. */
  language?: string;
  as?: React.ElementType;
}

export type Forwarded = { forwardedRef: React.ForwardedRef<HTMLElement> };

/**
 * The Root's map, for a panel tab: the Root's places and the view's overlays. Its module
 * imports no `Root`, so a lazy chunk of it shares nothing a standalone Canvas loads.
 */
export const RootMap = forwardRef<
  HTMLElement,
  Omit<
    MapProps,
    "iiifContent" | "navPlace" | "georeferences" | "request" | "language"
  >
>(function RootMap(props, ref) {
  return <ConnectedMap {...props} scope="view" forwardedRef={ref} />;
});

/** The Root's places, and the overlays of the view (or, standalone, every Canvas). */
export function ConnectedMap({
  scope,
  onSelect,
  ...rest
}: Omit<MapProps, "iiifContent" | "request" | "language"> &
  Forwarded & { scope: "view" | "all" }) {
  const context = useOptionalClover()!;
  const features = useOptionalCloverSelector(
    (state) => navPlaceOf(state.manifest, state.collection, context.language),
    navPlaceOf(null),
  );
  const all = useOptionalCloverSelector(
    (state) => georeferencesOf(state.manifest),
    NONE,
  );
  const shown = useOptionalCloverSelector(
    (state) => selectVisibleCanvases(state.manifest, state.canvasId),
    NO_CANVASES,
  );
  // The same array while the view holds, so the map is not re-framed under the reader.
  const overlays = useMemo(
    () =>
      scope === "all"
        ? all
        : all.filter((overlay) =>
            shown.some((canvas) => canvas.id === overlay.canvasId),
          ),
    [scope, all, shown],
  );
  return (
    <MapView
      {...rest}
      features={features}
      overlays={overlays}
      request={context.clover.request}
      onSelect={(feature) => {
        onSelect?.(feature);
        const canvasId = feature.properties.canvasId;
        if (canvasId) context.clover.goTo(canvasId);
      }}
    />
  );
}

const NONE: Georeference[] = [];
const NO_CANVASES: ReturnType<typeof selectVisibleCanvases> = [];

/** GeoJSON and annotations handed in, with no Root to read. */
export function GivenMap({
  navPlace,
  georeferences,
  ...rest
}: Omit<MapProps, "iiifContent" | "request" | "language"> & Forwarded) {
  const features = useGiven(navPlace, (value) =>
    navPlaceOf(
      {
        id: "geomap:given",
        type: "Manifest",
        navPlace: value,
        items: [],
      } as never,
      null,
    ),
  );
  const overlays = useGiven(georeferences, (value) =>
    ((value as unknown[]) ?? [])
      .map((annotation) => readGeoreference(annotation as never))
      .filter((overlay): overlay is Georeference => Boolean(overlay)),
  );
  return <MapView {...rest} features={features} overlays={overlays} />;
}

/** A value read from a prop, recomputed only when the prop's identity changes. */
function useGiven<T>(value: unknown, read: (value: unknown) => T): T {
  const memo = useRef<{ value: unknown; result: T } | null>(null);
  if (!memo.current || memo.current.value !== value) {
    memo.current = { value, result: read(value) };
  }
  return memo.current.result;
}

/** Longer side, in pixels, of the image an overlay draws. */
const OVERLAY_SIZE = 2048;

const NAVPLACE = "geomap-navplace";
const FILL = "geomap-navplace-fill";
const LINE = "geomap-navplace-line";
const POINT = "geomap-navplace-point";
const CLICKABLE = [FILL, LINE, POINT];

interface ViewProps
  extends Omit<
      MapProps,
      "iiifContent" | "navPlace" | "georeferences" | "language"
    >,
    Forwarded {
  features: MapFeatureCollection;
  overlays: Georeference[];
}

function MapView({
  features,
  overlays,
  overlay = true,
  overlayOpacity = 0.75,
  styleUrl,
  workerUrl,
  scrollZoom = false,
  onSelect,
  request,
  forwardedRef,
  as: Tag = "div",
  className,
  style,
  ...rest
}: ViewProps) {
  const { t } = useCloverTranslation();
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const latest = useRef({ onSelect, t });
  latest.current = { onSelect, t };

  // MapLibre, loaded and started once.
  useEffect(() => {
    let live = true;
    let instance: any = null;
    let observer: ResizeObserver | null = null;
    import("maplibre-gl")
      .then((module) => {
        // ES builds export `Map` by name; a CommonJS interop may wrap it in `default`.
        const maplibre: any =
          "Map" in module ? module : (module as any).default;
        if (!live || !container.current) return;
        const worker = workerUrl ?? getMapWorkerUrl();
        if (worker) maplibre.setWorkerUrl(worker);
        const { t } = latest.current;
        instance = new maplibre.Map({
          container: container.current,
          style: styleUrl ?? DEFAULT_STYLE_URL,
          center: [0, 20],
          zoom: 1,
          maxPitch: 0,
          dragRotate: false,
          scrollZoom,
          attributionControl: { compact: true },
          locale: {
            "NavigationControl.ZoomIn": t("imageZoomIn"),
            "NavigationControl.ZoomOut": t("imageZoomOut"),
          },
        });
        instance.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          "top-right",
        );
        instance.on("load", () => {
          if (!live) return;
          if (!styleUrl) applyDefaultBasemap(instance);
          // Credits behind their ⓘ, so they do not cover a small map; one press away.
          container.current
            ?.querySelector(".maplibregl-ctrl-attrib")
            ?.classList.remove("maplibregl-compact-show");
          addPlaceLayers(instance, accentOf(container.current));
          for (const layer of CLICKABLE) {
            instance.on("click", layer, (event: any) => {
              const feature = event.features?.[0] as MapFeature | undefined;
              if (!feature) return;
              const title = feature.properties?.title;
              if (title) {
                new maplibre.Popup({
                  closeButton: false,
                  offset: 8,
                  className: "clover-geomap-popup",
                })
                  .setLngLat(event.lngLat)
                  .setText(String(title))
                  .addTo(instance);
              }
              latest.current.onSelect?.(feature);
            });
            instance.on("mouseenter", layer, () => {
              instance.getCanvas().style.cursor = "pointer";
            });
            instance.on("mouseleave", layer, () => {
              instance.getCanvas().style.cursor = "";
            });
          }
          setMap(instance);
        });
        // A map in a tab or panel is sized late: keep MapLibre's canvas in step.
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => instance?.resize());
          observer.observe(container.current);
        }
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
      observer?.disconnect();
      instance?.remove();
      setMap(null);
    };
    // Style, worker and wheel are read once: a new map would be a new viewer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The places.
  useEffect(() => {
    map?.getSource(NAVPLACE)?.setData(features);
  }, [map, features]);

  // The overlays: one canvas source each, under the places.
  const drawn = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!map) return;
    let live = true;
    const wanted = overlay ? overlays : [];
    const ids = new Set(wanted.map((item) => item.id));
    for (const [id, layer] of Object.entries(drawn.current)) {
      if (ids.has(id)) continue;
      if (map.getLayer(layer)) map.removeLayer(layer);
      if (map.getSource(layer)) map.removeSource(layer);
      delete drawn.current[id];
    }
    wanted.forEach((item, index) => {
      if (drawn.current[item.id]) return;
      const layer = `geomap-overlay-${index}-${hash(item.id)}`;
      drawn.current[item.id] = layer;
      void drawOverlay(item, request).then((canvas) => {
        if (!live || !canvas || drawn.current[item.id] !== layer) return;
        const corners = cornersOf(item);
        if (!corners || map.getSource(layer)) return;
        map.addSource(layer, {
          type: "canvas",
          canvas,
          coordinates: corners,
          animate: false,
        });
        map.addLayer(
          {
            id: layer,
            type: "raster",
            source: layer,
            paint: {
              "raster-opacity": overlayOpacity,
              "raster-fade-duration": 0,
            },
          },
          map.getLayer(FILL) ? FILL : undefined,
        );
      });
    });
    return () => {
      live = false;
    };
    // `overlayOpacity` is applied below without redrawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, overlays, overlay, request]);

  useEffect(() => {
    if (!map) return;
    for (const layer of Object.values(drawn.current)) {
      if (map.getLayer(layer)) {
        map.setPaintProperty(layer, "raster-opacity", overlayOpacity);
      }
    }
  }, [map, overlayOpacity]);

  // Frame what there is: a lone point closer in, anything else to its bounds.
  useEffect(() => {
    if (!map) return;
    const bounds = boundsOf(features.features, overlay ? overlays : []);
    if (!bounds) return;
    const [[west, south], [east, north]] = bounds;
    if (west === east && south === north) {
      map.jumpTo({ center: [west, south], zoom: 8 });
    } else {
      map.fitBounds(bounds, { padding: 32, maxZoom: 12, duration: 0 });
    }
  }, [map, features, overlays, overlay]);

  return (
    <Tag
      ref={forwardedRef}
      className={join("clover-geomap", className)}
      data-status={failed ? "error" : map ? "ready" : "loading"}
      // Functional: the map needs a box to draw in, with or without the stylesheet.
      style={{
        position: "relative",
        height: "var(--clover-map-height, 24rem)",
        ...style,
      }}
      {...rest}
    >
      <div
        ref={container}
        className="clover-geomap-canvas"
        role="region"
        aria-label={t("mapLabel")}
        style={{ position: "absolute", inset: 0 }}
      />
      {failed && (
        <p className="clover-geomap-error" role="alert">
          {t("mapUnavailable")}
        </p>
      )}
    </Tag>
  );
}

/** The accent token, resolved: MapLibre paints with WebGL, which cannot read `var()`. */
function accentOf(element: Element | null): string {
  const value = element
    ? getComputedStyle(element).getPropertyValue("--clover-color-accent").trim()
    : "";
  return value || "#0065c3";
}

/** The places' source and layers: areas, lines and points, honouring simplestyle. */
function addPlaceLayers(map: any, color: string) {
  map.addSource(NAVPLACE, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: FILL,
    type: "fill",
    source: NAVPLACE,
    filter: [
      "match",
      ["geometry-type"],
      ["Polygon", "MultiPolygon"],
      true,
      false,
    ],
    paint: {
      "fill-color": ["coalesce", ["get", "fill"], color],
      "fill-opacity": ["coalesce", ["get", "fill-opacity"], 0.18],
    },
  });
  map.addLayer({
    id: LINE,
    type: "line",
    source: NAVPLACE,
    filter: [
      "match",
      ["geometry-type"],
      ["LineString", "MultiLineString", "Polygon", "MultiPolygon"],
      true,
      false,
    ],
    paint: {
      "line-color": ["coalesce", ["get", "stroke"], color],
      "line-width": ["coalesce", ["get", "stroke-width"], 2],
      "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
    },
  });
  map.addLayer({
    id: POINT,
    type: "circle",
    source: NAVPLACE,
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    paint: {
      "circle-radius": 6,
      "circle-color": ["coalesce", ["get", "marker-color"], color],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

/**
 * An overlay's picture: the image (about 2048 px), clipped to its mask, on a canvas for
 * MapLibre's canvas source. Null if the image will not load (or, without CORS, cannot be
 * drawn into WebGL).
 */
async function drawOverlay(
  overlay: Georeference,
  request: CloverRequest | undefined,
): Promise<HTMLCanvasElement | null> {
  const url = overlayImageUrl(overlay.image, OVERLAY_SIZE);
  if (!url) return null;
  const image = await new Promise<HTMLImageElement | null>((done) => {
    const element = new Image();
    element.crossOrigin = sendsCredentials(request)
      ? "use-credentials"
      : "anonymous";
    element.onload = () => done(element);
    element.onerror = () => done(null);
    element.src = url;
  });
  if (!image?.naturalWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  if (overlay.mask) {
    const sx = canvas.width / overlay.width;
    const sy = canvas.height / overlay.height;
    context.beginPath();
    overlay.mask.forEach(([x, y], index) =>
      index ? context.lineTo(x * sx, y * sy) : context.moveTo(x * sx, y * sy),
    );
    context.closePath();
    context.clip();
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** A short, stable token for an id, for a layer name. */
function hash(text: string): string {
  let value = 0;
  for (let i = 0; i < text.length; i++) {
    value = (value * 31 + text.charCodeAt(i)) | 0;
  }
  return (value >>> 0).toString(36);
}
