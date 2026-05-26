/**
 * CloverMap — a Leaflet-based map component for IIIF resources.
 *
 * Supports:
 *   - navPlace GeoJSON (https://iiif.io/api/extension/navplace/)
 *   - Georeference Extension annotations + optional warped image overlay
 *     (https://iiif.io/api/extension/georef/)
 *   - Arbitrary GeoJSON via the `geoJson` escape-hatch prop
 */

import "leaflet/dist/leaflet.css";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import { Wrapper } from "src/components/Map/Map.styled";
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
  color?: string;
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
   *      @allmaps/leaflet and display the warped IIIF image on the map.
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
   * georeferenced IIIF image as a warped overlay using @allmaps/leaflet.
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
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap contributors",
};

/** Color used for navPlace features */
const NAV_PLACE_COLOR = "#007fa3";
/** Color used for GCP control point markers */
const GCP_COLOR = "#c05c00";

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
  const href = resource?.homepage || resource?.id;

  if (!title && !featureLabel && !summary && !thumbnail && !context) return "";

  const escapedTitle = escapeHtml(title || featureLabel || "Location");
  const escapedFeatureLabel =
    featureLabel && featureLabel !== title ? escapeHtml(featureLabel) : "";
  const escapedSummary = summary ? escapeHtml(summary) : "";
  const escapedContext = context ? escapeHtml(context) : "";
  const escapedThumbnail = thumbnail ? escapeHtml(thumbnail) : "";
  const escapedHref = href ? escapeHtml(href) : "";

  return `
    <div class="clover-map-popup">
      ${
        escapedThumbnail
          ? `<div class="clover-map-popup-media"><img src="${escapedThumbnail}" alt="" loading="lazy" /></div>`
          : ""
      }
      <div class="clover-map-popup-body">
        ${escapedContext ? `<div class="clover-map-popup-context">${escapedContext}</div>` : ""}
        ${
          escapedHref
            ? `<a class="clover-map-popup-title" href="${escapedHref}" target="_blank" rel="noopener noreferrer">${escapedTitle}</a>`
            : `<div class="clover-map-popup-title">${escapedTitle}</div>`
        }
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
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const navPlaceLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const geoJsonLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const gcpLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const warpedLayerRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);
  const [mapReady, setMapReady] = useState(false);
  const [iiifNavPlace, setIiifNavPlace] =
    useState<GeoJSON.FeatureCollection | null>(null);

  // Combine the single + multiple georef annotation props into one list.
  const allGeorefAnnotations = useMemo(
    () =>
      [
        ...(georefAnnotation ? [georefAnnotation] : []),
        ...(georefAnnotations ?? []),
      ].filter(Boolean) as GeoreferenceAnnotation[],
    [georefAnnotation, georefAnnotations],
  );

  // Each annotation's parsed GCPs, kept aligned with allGeorefAnnotations.
  const gcpsByAnnotation = useMemo(
    () =>
      allGeorefAnnotations.map((annotation) =>
        parseGeoreferenceAnnotation(annotation),
      ),
    [allGeorefAnnotations],
  );

  // Flat list of every GCP across all annotations (for rendering + fit bounds).
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
              }).then((response) => response.json())
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

  // Keep click handler current without re-initialising the map
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Toggle crosshair cursor class
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    mapRef.current
      .getContainer()
      .classList.toggle("clover-map-crosshair", useCrosshairCursor);
  }, [mapReady, useCrosshairCursor]);

  // ── Map size invalidation helpers ─────────────────────────────────────────

  const refreshMap = () => mapRef.current?.invalidateSize();

  const queueMapRefresh = () => {
    window.requestAnimationFrame(() => {
      refreshMap();
      window.requestAnimationFrame(refreshMap);
    });
    window.setTimeout(refreshMap, 0);
    window.setTimeout(refreshMap, 100);
  };

  // ── Initialise Leaflet (runs once on mount) ───────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !containerRef.current) return;

      mapRef.current = L.map(containerRef.current, {
        center: [center.latitude, center.longitude],
        zoom: center.zoom,
      });

      L.tileLayer(tileLayer.url, {
        attribution: tileLayer.attribution,
      }).addTo(mapRef.current);

      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
      gcpLayerRef.current = L.layerGroup().addTo(mapRef.current);

      mapRef.current.on("click", (event) => {
        onMapClickRef.current?.([
          Number(event.latlng.lng.toFixed(5)),
          Number(event.latlng.lat.toFixed(5)),
        ]);
      });

      mapRef.current.on("dragstart", () =>
        mapRef.current?.getContainer().classList.add("clover-map-dragging"),
      );
      mapRef.current.on("dragend", () =>
        mapRef.current?.getContainer().classList.remove("clover-map-dragging"),
      );

      setMapReady(true);
      queueMapRefresh();
    }

    initializeMap();

    return () => {
      isMounted = false;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      navPlaceLayerRef.current = null;
      geoJsonLayerRef.current = null;
      markerLayerRef.current = null;
      gcpLayerRef.current = null;
      warpedLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-centre when center prop changes ────────────────────────────────────

  useEffect(() => {
    if (!mapReady || !mapRef.current || fitToData) return;
    mapRef.current.setView([center.latitude, center.longitude], center.zoom);
    queueMapRefresh();
    // `fitToData` intentionally omitted — only recenter on explicit center changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.latitude, center.longitude, center.zoom, mapReady]);

  // ── Render navPlace GeoJSON layer ─────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function renderNavPlace() {
      if (!mapReady || !mapRef.current) return;
      const L = await import("leaflet");
      if (!isMounted || !mapRef.current) return;

      if (navPlaceLayerRef.current) {
        navPlaceLayerRef.current.remove();
        navPlaceLayerRef.current = null;
      }

      const featureCollection = normalizeNavPlace(resolvedNavPlace);
      if (!featureCollection?.features?.length) return;

      navPlaceLayerRef.current = L.geoJSON(featureCollection, {
        pointToLayer: (_feature, latLng) =>
          L.circleMarker(latLng, {
            radius: 6,
            color: NAV_PLACE_COLOR,
            fillColor: NAV_PLACE_COLOR,
            fillOpacity: 0.8,
            weight: 2,
          }),
        style: {
          color: NAV_PLACE_COLOR,
          fillColor: NAV_PLACE_COLOR,
          fillOpacity: 0.18,
          weight: 2,
        },
        onEachFeature: (feature, layer) => {
          const popup = buildNavPlacePopup(feature);
          if (popup) {
            layer.bindPopup(popup, {
              className: "clover-map-leaflet-popup",
              maxWidth: 320,
              minWidth: 240,
            });
            return;
          }

          const label = getNavPlaceTitle(feature);
          if (label) layer.bindTooltip(label);
        },
      }).addTo(mapRef.current);

      queueMapRefresh();
    }

    renderNavPlace();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedNavPlace, mapReady]);

  // ── Render raw geoJson layer ──────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function renderGeoJson() {
      if (!mapReady || !mapRef.current) return;
      const L = await import("leaflet");
      if (!isMounted || !mapRef.current) return;

      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
        geoJsonLayerRef.current = null;
      }

      const features =
        geoJson && "features" in geoJson ? geoJson.features : null;
      const hasData = geoJson && (features ? features.length > 0 : true);
      if (!hasData) return;

      geoJsonLayerRef.current = L.geoJSON(geoJson as GeoJSON.GeoJsonObject, {
        pointToLayer: (_feature, latLng) =>
          L.circleMarker(latLng, {
            radius: 6,
            color: NAV_PLACE_COLOR,
            fillColor: NAV_PLACE_COLOR,
            fillOpacity: 0.8,
            weight: 2,
          }),
        style: {
          color: NAV_PLACE_COLOR,
          fillColor: NAV_PLACE_COLOR,
          fillOpacity: 0.18,
          weight: 2,
        },
        onEachFeature: (feature, layer) => {
          const label = getNavPlaceLabel(feature?.properties?.label);
          if (label) layer.bindTooltip(label);
        },
      }).addTo(mapRef.current);

      queueMapRefresh();
    }

    renderGeoJson();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJson, mapReady]);

  // ── Render custom marker layer ────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function renderMarkers() {
      if (!mapReady || !mapRef.current || !markerLayerRef.current) return;
      const L = await import("leaflet");
      if (!isMounted || !markerLayerRef.current) return;

      markerLayerRef.current.clearLayers();
      markers.forEach((marker, index) => {
        L.circleMarker([marker.latitude, marker.longitude], {
          radius: 6,
          color: marker.color ?? "#4e2a84",
          fillColor: marker.color ?? "#4e2a84",
          fillOpacity: 0.8,
          weight: 2,
        })
          .bindTooltip(marker.label ?? `Point ${index + 1}`)
          .addTo(markerLayerRef.current!);
      });

      queueMapRefresh();
    }

    renderMarkers();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, markers]);

  // ── Render GCP control-point markers ─────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function renderGCPs() {
      if (!mapReady || !mapRef.current || !gcpLayerRef.current) return;
      if (!showControlPoints) {
        gcpLayerRef.current.clearLayers();
        return;
      }

      const L = await import("leaflet");
      if (!isMounted || !gcpLayerRef.current) return;

      gcpLayerRef.current.clearLayers();
      // Number control points per-annotation so each georeferenced sheet's
      // markers read "Control Point 1..n" rather than a single global sequence.
      const multipleMaps = gcpsByAnnotation.length > 1;
      gcpsByAnnotation.forEach((annotationGcps, mapIndex) => {
        annotationGcps.forEach((gcp, index) => {
          const tooltip = multipleMaps
            ? `Map ${mapIndex + 1} · Control Point ${index + 1}`
            : `Control Point ${index + 1}`;
          L.circleMarker([gcp.geoCoords[1], gcp.geoCoords[0]], {
            radius: 7,
            color: GCP_COLOR,
            fillColor: GCP_COLOR,
            fillOpacity: 0.85,
            weight: 2,
          })
            .bindTooltip(tooltip)
            .addTo(gcpLayerRef.current!);
        });
      });

      queueMapRefresh();
    }

    renderGCPs();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, gcpsByAnnotation, showControlPoints]);

  // ── Render warped image overlay (via @allmaps/leaflet) ────────────────────

  useEffect(() => {
    let isMounted = true;

    async function renderWarpedLayer() {
      if (!mapReady || !mapRef.current) return;

      // Remove any existing warped layer
      if (warpedLayerRef.current) {
        warpedLayerRef.current.remove();
        warpedLayerRef.current = null;
      }

      if (!showImageOverlay) return;

      // Only annotations with ≥ 3 GCPs can be warped.
      const overlayAnnotations = allGeorefAnnotations.filter(
        (_annotation, index) => gcpsByAnnotation[index]?.length >= 3,
      );
      if (overlayAnnotations.length === 0) return;

      const { WarpedMapLayer } = await import("@allmaps/leaflet");
      if (!isMounted || !mapRef.current) return;

      // A single WarpedMapLayer can host many georeferenced maps. Seed it with
      // the first annotation, then add the rest so multiple sheets tile onto
      // one map.
      const [first, ...rest] = overlayAnnotations;
      const layer = new WarpedMapLayer(first, {
        opacity: imageOverlayOpacity,
      });
      layer.addTo(mapRef.current);

      for (const annotation of rest) {
        try {
          await layer.addGeoreferenceAnnotation(annotation);
        } catch (error) {
          console.error(`Failed to add georeference annotation: ${error}`);
        }
        if (!isMounted) break;
      }

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
    let isMounted = true;

    async function fitDataBounds() {
      if (!fitToData || !mapReady || !mapRef.current) return;
      const L = await import("leaflet");
      if (!isMounted || !mapRef.current) return;

      const bounds = L.latLngBounds([]);

      // navPlace features
      const navPlaceFC = normalizeNavPlace(resolvedNavPlace);
      if (navPlaceFC?.features?.length) {
        const nb = L.geoJSON(navPlaceFC).getBounds();
        if (nb.isValid()) bounds.extend(nb);
      }

      // raw geoJson
      if (geoJson) {
        const gb = L.geoJSON(geoJson as GeoJSON.GeoJsonObject).getBounds();
        if (gb.isValid()) bounds.extend(gb);
      }

      // custom markers
      markers.forEach((marker) => {
        bounds.extend([marker.latitude, marker.longitude]);
      });

      // GCPs (geographic coordinates)
      gcps.forEach((gcp) => {
        bounds.extend([gcp.geoCoords[1], gcp.geoCoords[0]]);
      });

      if (!bounds.isValid()) return;

      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        mapRef.current.setView(bounds.getCenter(), 8);
      } else {
        mapRef.current.fitBounds(bounds, { maxZoom: 12, padding: [32, 32] });
      }

      queueMapRefresh();
    }

    fitDataBounds();
    return () => {
      isMounted = false;
    };
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
      <Wrapper ref={containerRef} data-testid="clover-map" />
    </ErrorBoundary>
  );
};

export default CloverMap;
