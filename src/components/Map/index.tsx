// dts-bundle-generator (used for the "map" library build) only sees ambient declarations
// reachable via each entry's own reference/import graph, not the root tsconfig's `include`
// glob. Without this reference, building this file's library bundle fails with "Cannot find
// module 'maplibre-gl/dist/maplibre-gl.css'" even though decs.d.ts already declares it.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../decs.d.ts" />
/**
 * CloverMap — a MapLibre-based map component for IIIF resources.
 *
 * Supports:
 *   - navPlace GeoJSON (https://iiif.io/api/extension/navplace/)
 *   - Georeference Extension annotations + optional warped image overlay
 *     (https://iiif.io/api/extension/georef/)
 *   - Arbitrary GeoJSON via the `geoJson` escape-hatch prop
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import Controls from "src/components/Map/Controls";
import { Canvas, Wrapper } from "src/components/Map/Map.styled";
import { theme } from "src/styles/stitches.config";
import {
  GeoreferenceAnnotation,
  GroundControlPoint,
  NavPlaceDisplayLevel,
  NavPlaceGeoJSON,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getNavPlaceLabel,
  normalizeNavPlace,
  parseGeoreferenceAnnotation,
} from "src/lib/georef-helpers";

// ── Public types (re-exported from index) ─────────────────────────────────────

export type {
  GeoreferenceAnnotation,
  GroundControlPoint,
  NavPlaceDisplayLevel,
  NavPlaceGeoJSON,
};

export interface MapMarker {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface MapCenter {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapTileLayer {
  url: string;
  attribution: string;
}

export interface CloverMapProps {
  /** Map center and default zoom level. Defaults to a world view. */
  center?: MapCenter;
  /** Auto-fit the viewport to display all data (navPlace, GCPs, geoJson markers). */
  fitToData?: boolean;

  /**
   * IIIF navPlace GeoJSON to render as geographic feature overlays.
   * Accepts a FeatureCollection, Feature, or bare geometry object.
   * Feature `properties.label` may be a plain string or an IIIF InternationalString.
   * https://iiif.io/api/extension/navplace/
   */
  navPlace?: NavPlaceGeoJSON | null;

  /**
   * IIIF Presentation resource used to derive navPlace features with resource
   * context for map popups. Accepts a URL or a prefetched IIIF object.
   */
  iiifContent?: string | object | null;

  /**
   * Resource level to extract when `iiifContent` is set. `all` extracts every
   * navPlace value found while traversing the IIIF resource.
   * @default "all"
   */
  navPlaceLevel?: Exclude<NavPlaceDisplayLevel, "auto">;

  /**
   * A IIIF Georeference Extension annotation.
   * https://iiif.io/api/extension/georef/
   *
   * When provided the component will:
   *   1. Parse the annotation's GCPs and (if `showControlPoints` is true) render
   *      them as numbered circle markers on the map.
   *   2. Include GCP geo-coordinates in `fitToData` bounds.
   *   3. If `showImageOverlay` is true and there are ≥ 3 GCPs, load
   *      @allmaps/maplibre and display the warped IIIF image on the map.
   *
   * For the image overlay to work the annotation's `target.source` must reference
   * an IIIF Image API endpoint (type "ImageService2" or "ImageService3") rather
   * than a Canvas.  Pass the same "preview annotation" you would build for
   * the Allmaps viewer.
   */
  georefAnnotation?: GeoreferenceAnnotation | null;

  /**
   * Multiple IIIF Georeference Extension annotations to render together.
   * Each is parsed for GCPs and (when `showImageOverlay` is true and it has
   * ≥ 3 GCPs) added to a single warped-image overlay layer, so several
   * georeferenced sheets can tile onto one map at once. Combined with
   * `georefAnnotation` when both are provided.
   * https://iiif.io/api/extension/georef/
   */
  georefAnnotations?: GeoreferenceAnnotation[] | null;

  /**
   * Show the GCP markers extracted from the georeference annotation(s).
   * Each marker is numbered and shows its index as a tooltip.
   * @default true
   */
  showControlPoints?: boolean;

  /**
   * When true (and `georefAnnotation` is set with ≥ 3 GCPs), render the
   * georeferenced IIIF image as a warped overlay using @allmaps/maplibre.
   * @default false
   */
  showImageOverlay?: boolean;

  /**
   * Opacity of the warped image overlay (0 – 1).
   * @default 0.65
   */
  imageOverlayOpacity?: number;

  /**
   * Raw GeoJSON escape-hatch for data that doesn't fit the navPlace model.
   * Accepts a FeatureCollection or Feature.
   */
  geoJson?: GeoJSON.FeatureCollection | GeoJSON.Feature | null;

  /** Additional point markers to render (e.g. search results, custom pins). */
  markers?: MapMarker[];

  /** Called with [longitude, latitude] when the user clicks the map. */
  onMapClick?: (coordinates: [number, number]) => void;

  /** Display a crosshair cursor over the map (useful for coordinate picking). */
  useCrosshairCursor?: boolean;

  /** Tile layer. Defaults to OpenStreetMap. */
  tileLayer?: MapTileLayer;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_CENTER: MapCenter = { latitude: 20, longitude: 0, zoom: 2 };
const DEFAULT_TILE_LAYER: MapTileLayer = {
  url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  attribution:
    "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
};

// Source / layer ID constants
const NAVPLACE_SOURCE = "clover-navplace";
const NAVPLACE_FILL_LAYER = "clover-navplace-fill";
const NAVPLACE_LINE_LAYER = "clover-navplace-line";
const NAVPLACE_CIRCLE_LAYER = "clover-navplace-circle";
const GEOJSON_SOURCE = "clover-geojson";
const GEOJSON_FILL_LAYER = "clover-geojson-fill";
const GEOJSON_LINE_LAYER = "clover-geojson-line";
const GEOJSON_CIRCLE_LAYER = "clover-geojson-circle";
const MARKERS_SOURCE = "clover-markers";
const MARKERS_LAYER = "clover-markers-circle";
const GCP_SOURCE = "clover-gcps";
const GCP_LAYER = "clover-gcps-circle";
const WARPED_LAYER_ID = "clover-warped";

// Markers never take a custom color — every navPlace feature and custom
// marker renders as a solid dot in the app's accent color.
const ACCENT_COLOR = theme.colors.accent;
/** Color used for GCP control point markers */
const GCP_COLOR = "#c05c00";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Expand {s} subdomain placeholders to an array of tile URLs. */
function expandTileUrls(url: string): string[] {
  if (url.includes("{s}")) {
    return ["a", "b", "c"].map((s) => url.replace(/{s}/g, s));
  }
  return [url];
}

/**
 * MapLibre serializes nested GeoJSON properties to JSON strings. Re-parse any
 * known object-valued properties so popup helpers see the original shape.
 */
function parseMaplibreFeature(feature: GeoJSON.Feature): GeoJSON.Feature {
  if (!feature.properties) return feature;
  const props = { ...feature.properties };
  for (const key of ["iiifResource", "label", "summary"]) {
    const v = props[key];
    if (typeof v === "string" && (v.startsWith("{") || v.startsWith("["))) {
      try {
        props[key] = JSON.parse(v);
      } catch {
        // keep as string
      }
    }
  }
  return { ...feature, properties: props };
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getNavPlaceResource = (feature: GeoJSON.Feature) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (feature?.properties as any)?.iiifResource;
};

const getNavPlaceTitle = (feature: GeoJSON.Feature): string => {
  const resource = getNavPlaceResource(feature);
  return (
    getNavPlaceLabel(resource?.label) ||
    getNavPlaceLabel(feature?.properties?.label) ||
    resource?.id ||
    ""
  );
};

const buildNavPlacePopup = (feature: GeoJSON.Feature): string => {
  const resource = getNavPlaceResource(feature);
  const title = getNavPlaceTitle(feature);
  const featureLabel = getNavPlaceLabel(feature?.properties?.label);
  const summary =
    getNavPlaceLabel(feature?.properties?.summary) ||
    getNavPlaceLabel(resource?.summary);
  const parentLabel = getNavPlaceLabel(resource?.parent?.label);
  const thumbnail = resource?.thumbnail;
  const context = [resource?.type, parentLabel].filter(Boolean).join(" in ");

  if (!title && !featureLabel && !summary && !thumbnail && !context) return "";

  const escapedTitle = escapeHtml(title || featureLabel || "Location");
  const escapedFeatureLabel =
    featureLabel && featureLabel !== title ? escapeHtml(featureLabel) : "";
  const escapedSummary = summary ? escapeHtml(summary) : "";
  const escapedContext = context ? escapeHtml(context) : "";
  const escapedThumbnail = thumbnail ? escapeHtml(thumbnail) : "";

  return `
    <div class="clover-map-popup">
      ${
        escapedThumbnail
          ? `<div class="clover-map-popup-media"><img src="${escapedThumbnail}" alt="" loading="lazy" /></div>`
          : ""
      }
      <div class="clover-map-popup-body">
        ${escapedContext ? `<div class="clover-map-popup-context">${escapedContext}</div>` : ""}
        <div class="clover-map-popup-title">${escapedTitle}</div>
        ${
          escapedFeatureLabel
            ? `<div class="clover-map-popup-location">${escapedFeatureLabel}</div>`
            : ""
        }
        ${
          escapedSummary
            ? `<div class="clover-map-popup-summary">${escapedSummary}</div>`
            : ""
        }
      </div>
    </div>
  `;
};

// ── MapLibre layer helpers ────────────────────────────────────────────────────

function safeRemoveLayer(map: maplibregl.Map, id: string) {
  if (map.getLayer(id)) map.removeLayer(id);
}

function safeRemoveSource(map: maplibregl.Map, id: string) {
  if (map.getSource(id)) map.removeSource(id);
}

function removeNavPlaceLayers(map: maplibregl.Map) {
  safeRemoveLayer(map, NAVPLACE_CIRCLE_LAYER);
  safeRemoveLayer(map, NAVPLACE_LINE_LAYER);
  safeRemoveLayer(map, NAVPLACE_FILL_LAYER);
  safeRemoveSource(map, NAVPLACE_SOURCE);
}

function removeGeoJsonLayers(map: maplibregl.Map) {
  safeRemoveLayer(map, GEOJSON_CIRCLE_LAYER);
  safeRemoveLayer(map, GEOJSON_LINE_LAYER);
  safeRemoveLayer(map, GEOJSON_FILL_LAYER);
  safeRemoveSource(map, GEOJSON_SOURCE);
}

function removeMarkersLayer(map: maplibregl.Map) {
  safeRemoveLayer(map, MARKERS_LAYER);
  safeRemoveSource(map, MARKERS_SOURCE);
}

function removeGcpLayer(map: maplibregl.Map) {
  safeRemoveLayer(map, GCP_LAYER);
  safeRemoveSource(map, GCP_SOURCE);
}

function addGeoJsonLayers(
  map: maplibregl.Map,
  sourceId: string,
  fillId: string,
  lineId: string,
  circleId: string,
  data: GeoJSON.FeatureCollection | GeoJSON.Feature,
  color: string,
) {
  // Features may carry their own GeoJSON "simplestyle" properties
  // (https://github.com/mapbox/simplestyle-spec) — honor those when present,
  // falling back to the marker accent color/defaults otherwise.
  map.addSource(sourceId, { type: "geojson", data });
  map.addLayer({
    id: fillId,
    type: "fill",
    source: sourceId,
    filter: ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false],
    paint: {
      "fill-color": ["coalesce", ["get", "fill"], color],
      "fill-opacity": ["coalesce", ["get", "fill-opacity"], 0.18],
    },
  });
  map.addLayer({
    id: lineId,
    type: "line",
    source: sourceId,
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
    id: circleId,
    type: "circle",
    source: sourceId,
    filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
    paint: {
      "circle-radius": 6,
      "circle-color": ["coalesce", ["get", "marker-color"], color],
      "circle-opacity": 1,
      "circle-stroke-width": 2,
      "circle-stroke-color": ["coalesce", ["get", "marker-color"], color],
      "circle-stroke-opacity": 0.35,
    },
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const CloverMap: React.FC<CloverMapProps> = ({
  center = DEFAULT_CENTER,
  fitToData = false,
  navPlace = null,
  iiifContent = null,
  navPlaceLevel = "all",
  georefAnnotation = null,
  georefAnnotations = null,
  showControlPoints = true,
  showImageOverlay = false,
  imageOverlayOpacity = 0.65,
  geoJson = null,
  markers = [],
  onMapClick,
  useCrosshairCursor = false,
  tileLayer = DEFAULT_TILE_LAYER,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mlRef = useRef<typeof maplibregl | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const warpedLayerRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);
  const [mapReady, setMapReady] = useState(false);
  const [iiifNavPlace, setIiifNavPlace] =
    useState<GeoJSON.FeatureCollection | null>(null);

  const allGeorefAnnotations = useMemo(
    () =>
      [
        ...(georefAnnotation ? [georefAnnotation] : []),
        ...(georefAnnotations ?? []),
      ].filter(Boolean) as GeoreferenceAnnotation[],
    [georefAnnotation, georefAnnotations],
  );

  const gcpsByAnnotation = useMemo(
    () =>
      allGeorefAnnotations.map((annotation) =>
        parseGeoreferenceAnnotation(annotation),
      ),
    [allGeorefAnnotations],
  );

  const gcps = useMemo(() => gcpsByAnnotation.flat(), [gcpsByAnnotation]);

  const resolvedNavPlace = useMemo(() => {
    const collections = [normalizeNavPlace(navPlace), iiifNavPlace].filter(
      (collection): collection is GeoJSON.FeatureCollection =>
        Boolean(collection?.features?.length),
    );
    if (!collections.length) return null;
    return createNavPlaceFeatureCollection(
      collections.flatMap((collection) => collection.features),
    );
  }, [navPlace, iiifNavPlace]);

  useEffect(() => {
    let isMounted = true;

    async function loadIiifNavPlace() {
      if (!iiifContent) {
        setIiifNavPlace(null);
        return;
      }
      try {
        const resource =
          typeof iiifContent === "string"
            ? await fetch(iiifContent, {
                headers: { Accept: "application/json, application/ld+json" },
              }).then((r) => r.json())
            : iiifContent;
        if (!isMounted) return;
        const levels =
          navPlaceLevel === "all"
            ? undefined
            : [navPlaceLevel as Exclude<NavPlaceDisplayLevel, "auto" | "all">];
        const features = extractNavPlaceFeatures(resource, { levels });
        setIiifNavPlace(
          features.length ? createNavPlaceFeatureCollection(features) : null,
        );
      } catch (error) {
        if (!isMounted) return;
        console.error(`IIIF navPlace failed to load: ${error}`);
        setIiifNavPlace(null);
      }
    }

    loadIiifNavPlace();
    return () => {
      isMounted = false;
    };
  }, [iiifContent, navPlaceLevel]);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Toggle crosshair cursor class on the container
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    mapRef.current
      .getContainer()
      .classList.toggle("clover-map-crosshair", useCrosshairCursor);
  }, [mapReady, useCrosshairCursor]);

  // ── Map size helpers ───────────────────────────────────────────────────────

  const refreshMap = () => mapRef.current?.resize();

  const queueMapRefresh = () => {
    window.requestAnimationFrame(() => {
      refreshMap();
      window.requestAnimationFrame(refreshMap);
    });
    window.setTimeout(refreshMap, 0);
    window.setTimeout(refreshMap, 100);
  };

  // ── Initialise MapLibre (runs once on mount) ───────────────────────────────

  useEffect(() => {
    let isMounted = true;

    function startMap(ml: typeof maplibregl) {
      if (!containerRef.current) return;

      const map = new ml.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            "clover-tiles": {
              type: "raster",
              tiles: expandTileUrls(tileLayer.url),
              tileSize: 256,
              attribution: tileLayer.attribution,
            },
          },
          layers: [
            {
              id: "clover-tiles",
              type: "raster",
              source: "clover-tiles",
            },
          ],
        },
        center: [center.longitude, center.latitude],
        zoom: center.zoom,
        maxPitch: 0,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!isMounted) return;
        // Register permanent event handlers using stable layer IDs
        const layers = [
          NAVPLACE_FILL_LAYER,
          NAVPLACE_LINE_LAYER,
          NAVPLACE_CIRCLE_LAYER,
          GEOJSON_FILL_LAYER,
          GEOJSON_LINE_LAYER,
          GEOJSON_CIRCLE_LAYER,
        ];

        layers.forEach((layerId) => {
          map.on("click", layerId, (e) => {
            if (!e.features?.length) return;
            const feature = parseMaplibreFeature(
              e.features[0] as GeoJSON.Feature,
            );
            const popupHtml = buildNavPlacePopup(feature);
            if (popupHtml) {
              new ml.Popup({
                className: "clover-map-popup-wrapper",
                maxWidth: "320px",
              })
                .setLngLat(e.lngLat)
                .setHTML(popupHtml)
                .addTo(map);
              return;
            }
            const label =
              getNavPlaceTitle(feature) ||
              getNavPlaceLabel(feature?.properties?.label);
            if (label) {
              new ml.Popup({
                closeButton: false,
                offset: 8,
              })
                .setLngLat(e.lngLat)
                .setHTML(escapeHtml(label))
                .addTo(map);
            }
          });
          map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
          });
        });

        map.on("click", MARKERS_LAYER, (e) => {
          if (!e.features?.length) return;
          const label = e.features[0].properties?.label;
          if (label) {
            new ml.Popup({ closeButton: false, offset: 8 })
              .setLngLat(e.lngLat)
              .setHTML(escapeHtml(String(label)))
              .addTo(map);
          }
        });
        map.on("mouseenter", MARKERS_LAYER, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", MARKERS_LAYER, () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", GCP_LAYER, (e) => {
          if (!e.features?.length) return;
          const label = e.features[0].properties?.label;
          if (label) {
            new ml.Popup({ closeButton: false, offset: 8 })
              .setLngLat(e.lngLat)
              .setHTML(escapeHtml(String(label)))
              .addTo(map);
          }
        });
        map.on("mouseenter", GCP_LAYER, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", GCP_LAYER, () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", (e) => {
          onMapClickRef.current?.([
            Number(e.lngLat.lng.toFixed(5)),
            Number(e.lngLat.lat.toFixed(5)),
          ]);
        });

        map.on("dragstart", () =>
          map.getContainer().classList.add("clover-map-dragging"),
        );
        map.on("dragend", () =>
          map.getContainer().classList.remove("clover-map-dragging"),
        );

        setMapReady(true);
        queueMapRefresh();
      });
    }

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;
      await import("maplibre-gl/dist/maplibre-gl.css");
      const { default: ml } = await import("maplibre-gl");
      if (!isMounted || !containerRef.current) return;
      mlRef.current = ml;
      startMap(ml);
    }

    initMap();

    return () => {
      isMounted = false;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      warpedLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-centre when center prop changes ────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current || fitToData) return;
    mapRef.current.setCenter([center.longitude, center.latitude]);
    mapRef.current.setZoom(center.zoom);
    queueMapRefresh();
    // `fitToData` intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.latitude, center.longitude, center.zoom, mapReady]);

  // ── Render navPlace GeoJSON layer ─────────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    removeNavPlaceLayers(map);

    const featureCollection = normalizeNavPlace(resolvedNavPlace);
    if (!featureCollection?.features?.length) return;

    addGeoJsonLayers(
      map,
      NAVPLACE_SOURCE,
      NAVPLACE_FILL_LAYER,
      NAVPLACE_LINE_LAYER,
      NAVPLACE_CIRCLE_LAYER,
      featureCollection,
      ACCENT_COLOR,
    );

    queueMapRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedNavPlace, mapReady]);

  // ── Render raw geoJson layer ──────────────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    removeGeoJsonLayers(map);

    const features =
      geoJson && "features" in geoJson ? geoJson.features : null;
    const hasData = geoJson && (features ? features.length > 0 : true);
    if (!hasData) return;

    addGeoJsonLayers(
      map,
      GEOJSON_SOURCE,
      GEOJSON_FILL_LAYER,
      GEOJSON_LINE_LAYER,
      GEOJSON_CIRCLE_LAYER,
      geoJson as GeoJSON.FeatureCollection,
      ACCENT_COLOR,
    );

    queueMapRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJson, mapReady]);

  // ── Render custom marker layer ────────────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    removeMarkersLayer(map);
    if (!markers.length) return;

    const markerData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: markers.map((m, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [m.longitude, m.latitude] },
        properties: {
          label: m.label ?? `Point ${i + 1}`,
        },
      })),
    };

    map.addSource(MARKERS_SOURCE, { type: "geojson", data: markerData });
    map.addLayer({
      id: MARKERS_LAYER,
      type: "circle",
      source: MARKERS_SOURCE,
      paint: {
        "circle-radius": 6,
        "circle-color": ACCENT_COLOR,
        "circle-opacity": 1,
        "circle-stroke-width": 2,
        "circle-stroke-color": ACCENT_COLOR,
        "circle-stroke-opacity": 0.35,
      },
    });

    queueMapRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, markers]);

  // ── Render GCP control-point markers ─────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    removeGcpLayer(map);
    if (!showControlPoints || !gcpsByAnnotation.length) return;

    const multipleMaps = gcpsByAnnotation.length > 1;
    const gcpFeatures: GeoJSON.Feature[] = [];
    gcpsByAnnotation.forEach((annotationGcps, mapIndex) => {
      annotationGcps.forEach((gcp, index) => {
        const label = multipleMaps
          ? `Map ${mapIndex + 1} · Control Point ${index + 1}`
          : `Control Point ${index + 1}`;
        gcpFeatures.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [gcp.geoCoords[0], gcp.geoCoords[1]],
          },
          properties: { label },
        });
      });
    });

    if (!gcpFeatures.length) return;

    const gcpData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: gcpFeatures,
    };

    map.addSource(GCP_SOURCE, { type: "geojson", data: gcpData });
    map.addLayer({
      id: GCP_LAYER,
      type: "circle",
      source: GCP_SOURCE,
      paint: {
        "circle-radius": 7,
        "circle-color": GCP_COLOR,
        "circle-opacity": 1,
        "circle-stroke-width": 2,
        "circle-stroke-color": GCP_COLOR,
        "circle-stroke-opacity": 0.35,
      },
    });

    queueMapRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, gcpsByAnnotation, showControlPoints]);

  // ── Render warped image overlay (via @allmaps/maplibre) ───────────────────

  useEffect(() => {
    let isMounted = true;

    async function renderWarpedLayer() {
      if (!mapReady || !mapRef.current) return;
      const map = mapRef.current;

      if (warpedLayerRef.current) {
        safeRemoveLayer(map, WARPED_LAYER_ID);
        warpedLayerRef.current = null;
      }

      if (!showImageOverlay) return;

      const overlayAnnotations = allGeorefAnnotations.filter(
        (_annotation, index) => gcpsByAnnotation[index]?.length >= 3,
      );
      if (overlayAnnotations.length === 0) return;

      const { WarpedMapLayer } = await import("@allmaps/maplibre");
      if (!isMounted || !mapRef.current) return;

      // Find the first existing data layer to insert warped layer below it
      const dataLayers = [
        NAVPLACE_FILL_LAYER,
        NAVPLACE_LINE_LAYER,
        NAVPLACE_CIRCLE_LAYER,
        GEOJSON_FILL_LAYER,
        GEOJSON_LINE_LAYER,
        GEOJSON_CIRCLE_LAYER,
        MARKERS_LAYER,
        GCP_LAYER,
      ];
      const beforeId = dataLayers.find((id) => map.getLayer(id));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layer = new WarpedMapLayer({ layerId: WARPED_LAYER_ID } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addLayer(layer as any, beforeId);

      for (const annotation of overlayAnnotations) {
        try {
          await layer.addGeoreferenceAnnotation(annotation);
        } catch (error) {
          console.error(`Failed to add georeference annotation: ${error}`);
        }
        if (!isMounted) break;
      }

      layer.setOpacity(imageOverlayOpacity);
      warpedLayerRef.current = layer;
    }

    renderWarpedLayer();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapReady,
    allGeorefAnnotations,
    gcpsByAnnotation,
    showImageOverlay,
    imageOverlayOpacity,
  ]);

  // ── Fit viewport to all data ──────────────────────────────────────────────

  useEffect(() => {
    if (!fitToData || !mapReady || !mapRef.current || !mlRef.current) return;
    const map = mapRef.current;
    const ml = mlRef.current;

    const bounds = new ml.LngLatBounds();

    const navPlaceFC = normalizeNavPlace(resolvedNavPlace);
    if (navPlaceFC?.features?.length) {
      navPlaceFC.features.forEach((f) => {
        extendBoundsWithFeature(bounds, f);
      });
    }

    if (geoJson) {
      const features =
        "features" in geoJson ? geoJson.features : [geoJson as GeoJSON.Feature];
      features.forEach((f) => extendBoundsWithFeature(bounds, f));
    }

    markers.forEach((marker) => {
      bounds.extend([marker.longitude, marker.latitude]);
    });

    gcps.forEach((gcp) => {
      bounds.extend([gcp.geoCoords[0], gcp.geoCoords[1]]);
    });

    if (bounds.isEmpty()) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    if (ne.lng === sw.lng && ne.lat === sw.lat) {
      map.setCenter([ne.lng, ne.lat]);
      map.setZoom(8);
    } else {
      map.fitBounds(bounds, { maxZoom: 12, padding: 32 });
    }

    queueMapRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    center.latitude,
    center.longitude,
    center.zoom,
    fitToData,
    resolvedNavPlace,
    geoJson,
    mapReady,
    markers,
    gcps,
  ]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Wrapper data-testid="clover-map">
        <Controls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />
        <Canvas ref={containerRef} />
      </Wrapper>
    </ErrorBoundary>
  );
};

export default CloverMap;

// ── Bounds helper ─────────────────────────────────────────────────────────────

function extendBoundsWithFeature(
  bounds: maplibregl.LngLatBounds,
  feature: GeoJSON.Feature,
) {
  if (!feature?.geometry) return;
  const coords = collectCoordinates(feature.geometry);
  coords.forEach((c) => bounds.extend(c as [number, number]));
}

function collectCoordinates(
  geometry: GeoJSON.Geometry,
): Array<[number, number]> {
  switch (geometry.type) {
    case "Point":
      return [geometry.coordinates as [number, number]];
    case "MultiPoint":
    case "LineString":
      return geometry.coordinates as Array<[number, number]>;
    case "MultiLineString":
    case "Polygon":
      return geometry.coordinates.flat() as Array<[number, number]>;
    case "MultiPolygon":
      return geometry.coordinates.flat(2) as Array<[number, number]>;
    case "GeometryCollection":
      return geometry.geometries.flatMap(collectCoordinates);
    default:
      return [];
  }
}
