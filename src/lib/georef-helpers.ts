/**
 * Helpers for the IIIF Georeference Extension and navPlace Extension.
 *
 * Georeference spec: https://iiif.io/api/extension/georef/
 * navPlace spec:     https://iiif.io/api/extension/navplace/
 */

import { InternationalString } from "@iiif/presentation-3";

// ── JSON-LD context URIs ──────────────────────────────────────────────────────

export const GEOREFERENCE_CONTEXT =
  "http://iiif.io/api/extension/georef/1/context.json";
export const NAV_PLACE_CONTEXT =
  "http://iiif.io/api/extension/navplace/context.json";
export const PRESENTATION_CONTEXT =
  "http://iiif.io/api/presentation/3/context.json";

// ── Types: Georeference Extension ────────────────────────────────────────────

/** A single Ground Control Point (GCP): one image pixel ↔ one geographic coordinate. */
export interface GroundControlPoint {
  id?: string;
  /** Image pixel coordinates as [x, y]. */
  resourceCoords: [number, number];
  /** Geographic coordinates as [longitude, latitude] (WGS-84). */
  geoCoords: [number, number];
}

/** The `source` of a Georeference Annotation target. */
export interface GeoreferenceAnnotationSource {
  id: string;
  type: string; // e.g. "Canvas" | "ImageService2" | "ImageService3"
  width?: number;
  height?: number;
}

/**
 * A IIIF Georeference Extension annotation.
 * https://iiif.io/api/extension/georef/
 *
 * The `body` is a GeoJSON FeatureCollection whose Features each carry:
 *   - `properties.resourceCoords`: image pixel [x, y]
 *   - `geometry.coordinates`:      geographic [longitude, latitude]
 */
export interface GeoreferenceAnnotation {
  "@context"?: string | string[];
  id?: string;
  type: "Annotation";
  motivation: "georeferencing";
  target: {
    type: "SpecificResource";
    source: GeoreferenceAnnotationSource;
    selector?: {
      type: "SvgSelector";
      value: string;
    };
  };
  body: GeoJSON.FeatureCollection;
}

// ── Types: navPlace Extension ─────────────────────────────────────────────────

/**
 * A navPlace GeoJSON FeatureCollection.
 * Feature `properties.label` / `properties.summary` may be IIIF InternationalStrings.
 * https://iiif.io/api/extension/navplace/
 */
export type NavPlaceGeoJSON =
  | GeoJSON.FeatureCollection
  | GeoJSON.Feature
  | GeoJSON.Geometry;

export type NavPlaceResourceLevel =
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Annotation";

export type NavPlaceDisplayLevel = NavPlaceResourceLevel | "auto" | "all";

export interface NavPlaceResourceContext {
  id?: string;
  type?: NavPlaceResourceLevel | string;
  label?: string | InternationalString | null;
  summary?: string | InternationalString | null;
  thumbnail?: string;
  homepage?: string;
  parent?: NavPlaceResourceContext;
}

export type EnrichedNavPlaceProperties =
  NonNullable<GeoJSON.GeoJsonProperties> & {
    iiifResource?: NavPlaceResourceContext;
  };

export type EnrichedNavPlaceFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  EnrichedNavPlaceProperties
>;

export interface ExtractNavPlaceFeaturesOptions {
  levels?: NavPlaceResourceLevel[];
  parent?: NavPlaceResourceContext;
}

// ── Georeference helpers ──────────────────────────────────────────────────────

/**
 * Extract Ground Control Points from a IIIF Georeference Extension annotation.
 * Features with missing or non-numeric coordinates are silently skipped.
 */
export function parseGeoreferenceAnnotation(
  annotation: GeoreferenceAnnotation | null | undefined,
): GroundControlPoint[] {
  if (!annotation) return [];

  const features = Array.isArray(annotation?.body?.features)
    ? annotation.body.features
    : [];

  return features.reduce<GroundControlPoint[]>((acc, feature, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (feature?.properties ?? {}) as any;
    const resourceCoords = props.resourceCoords;
    const geoCoords =
      feature?.geometry?.type === "Point"
        ? (feature.geometry as GeoJSON.Point).coordinates
        : null;

    if (!Array.isArray(resourceCoords) || !Array.isArray(geoCoords)) {
      return acc;
    }

    const rc: [number, number] = [
      Number(resourceCoords[0]),
      Number(resourceCoords[1]),
    ];
    const gc: [number, number] = [Number(geoCoords[0]), Number(geoCoords[1])];

    if (rc.some(Number.isNaN) || gc.some(Number.isNaN)) return acc;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc.push({
      id: (feature as any).id ?? `gcp-${index}`,
      resourceCoords: rc,
      geoCoords: gc,
    });
    return acc;
  }, []);
}

/**
 * Adapt a stored Georeference Annotation for use with @allmaps/leaflet.
 *
 * For annotations that use `"type": "Canvas"` for their target source.
 * @allmaps/leaflet requires an IIIF Image API endpoint (`"type": "ImageService2"`
 * or `"ImageService3"`).  Call this helper to swap the source before passing
 * `georefAnnotation` + `showImageOverlay` to `<Map>`.
 *
 * @param annotation  The stored georef annotation (Canvas source).
 * @param imageServiceId  Base URL of the IIIF Image API for this canvas
 *   (e.g. `"https://iiif.example.edu/iiif/2/<id>"` for v2,
 *    or `"https://iiif.example.edu/iiif/3/<id>"` for v3).
 * @param serviceType  IIIF Image API version string. Defaults to `"ImageService2"`.
 */
export function adaptGeoreferenceAnnotationForOverlay(
  annotation: GeoreferenceAnnotation,
  imageServiceId: string,
  serviceType: "ImageService2" | "ImageService3" = "ImageService2",
): GeoreferenceAnnotation {
  return {
    ...annotation,
    target: {
      ...annotation.target,
      source: {
        id: imageServiceId,
        type: serviceType,
        width: annotation.target.source.width,
        height: annotation.target.source.height,
      },
    },
  };
}

/**
 * Type guard for a IIIF Georeference Extension annotation. Accepts a plain
 * annotation object (as embedded in a Canvas annotation page) and returns true
 * when it carries `motivation: "georeferencing"` and a FeatureCollection body.
 */
export function isGeoreferenceAnnotation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  annotation: any,
): annotation is GeoreferenceAnnotation {
  if (!annotation || typeof annotation !== "object") return false;

  const motivation = annotation.motivation;
  const hasGeoreferencing = Array.isArray(motivation)
    ? motivation.includes("georeferencing")
    : motivation === "georeferencing";

  return hasGeoreferencing && annotation?.body?.type === "FeatureCollection";
}

/**
 * Extract the IIIF Image API service id from a painting annotation body.
 * Handles Presentation 3 (`service[].id` + `type`) and Presentation 2
 * (`service[].@id` + `@type`) shapes, returning the first service whose type
 * is an ImageService (or the first service id as a fallback).
 *
 * @returns `{ id, type }` where `type` is `"ImageService2" | "ImageService3"`,
 *   or `undefined` when no usable image service is present.
 */
export function getImageServiceId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paintingBody: any,
): { id: string; type: "ImageService2" | "ImageService3" } | undefined {
  const services = paintingBody?.service;
  if (!Array.isArray(services) || services.length === 0) return undefined;

  for (const service of services) {
    if (!service || typeof service !== "object") continue;

    const id = service.id || service["@id"];
    if (typeof id !== "string") continue;

    const rawType = service.type || service["@type"];
    const type = Array.isArray(rawType) ? rawType[0] : rawType;

    if (type === "ImageService3") return { id, type: "ImageService3" };
    if (type === "ImageService2") return { id, type: "ImageService2" };
  }

  // Fallback: first service with any id, assume v2.
  for (const service of services) {
    const id = service?.id || service?.["@id"];
    if (typeof id === "string") return { id, type: "ImageService2" };
  }

  return undefined;
}

// ── navPlace helpers ──────────────────────────────────────────────────────────

const GEO_GEOMETRY_TYPES = new Set<string>([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
]);

/**
 * Normalize any GeoJSON value (FeatureCollection, Feature, or bare geometry)
 * to a FeatureCollection. Returns `null` if the value is not recognizable GeoJSON.
 */
export function normalizeNavPlace(
  geoJson: NavPlaceGeoJSON | null | undefined,
): GeoJSON.FeatureCollection | null {
  if (!geoJson || typeof geoJson !== "object") return null;

  if (geoJson.type === "FeatureCollection") {
    return geoJson as GeoJSON.FeatureCollection;
  }

  if (geoJson.type === "Feature") {
    return {
      type: "FeatureCollection",
      features: [geoJson as GeoJSON.Feature],
    };
  }

  if (GEO_GEOMETRY_TYPES.has(geoJson.type)) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: geoJson as GeoJSON.Geometry,
        },
      ],
    };
  }

  return null;
}

/**
 * Extract a display string from a navPlace Feature property that may be a
 * plain string or a IIIF InternationalString.
 */
export function getNavPlaceLabel(
  label: string | InternationalString | null | undefined,
): string {
  if (!label) return "";
  if (typeof label === "string") return label;

  const values = Object.values(label as Record<string, string[]>).find(
    (entry): entry is string[] => Array.isArray(entry) && entry.length > 0,
  );
  return values?.[0] ?? "";
}

function isNavPlaceResourceLevel(type: string): type is NavPlaceResourceLevel {
  return ["Collection", "Manifest", "Canvas", "Annotation"].includes(type);
}

function getFirstThumbnailUrl(thumbnail: unknown): string | undefined {
  if (!thumbnail) return undefined;

  if (typeof thumbnail === "string") return thumbnail;

  const thumbnailList = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
  const first = thumbnailList.find(Boolean);

  if (!first || typeof first !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resource = first as any;
  if (typeof resource.id === "string") return resource.id;
  if (typeof resource["@id"] === "string") return resource["@id"];

  return undefined;
}

function getFirstHomepageUrl(homepage: unknown): string | undefined {
  if (!homepage) return undefined;

  if (typeof homepage === "string") return homepage;

  const homepageList = Array.isArray(homepage) ? homepage : [homepage];
  const first = homepageList.find(Boolean);

  if (!first || typeof first !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resource = first as any;
  if (typeof resource.id === "string") return resource.id;
  if (typeof resource["@id"] === "string") return resource["@id"];

  return undefined;
}

function getNavPlaceResourceContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: any,
  parent?: NavPlaceResourceContext,
): NavPlaceResourceContext | undefined {
  if (!resource || typeof resource !== "object") return undefined;

  const rawType = resource.type || resource["@type"];
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  const id = resource.id || resource["@id"];

  return {
    id,
    type,
    label: resource.label ?? null,
    summary: resource.summary ?? null,
    thumbnail: getFirstThumbnailUrl(resource.thumbnail),
    homepage: getFirstHomepageUrl(resource.homepage),
    parent,
  };
}

function enrichNavPlaceFeature(
  feature: GeoJSON.Feature,
  context?: NavPlaceResourceContext,
): EnrichedNavPlaceFeature {
  return {
    ...feature,
    properties: {
      ...(feature.properties ?? {}),
      ...(context ? { iiifResource: context } : {}),
    },
  } as EnrichedNavPlaceFeature;
}

function getChildResources(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: any,
): unknown[] {
  if (!resource || typeof resource !== "object") return [];

  return [
    resource.items,
    resource.annotations,
    resource.manifests,
    resource.members,
  ]
    .filter(Array.isArray)
    .flat();
}

/**
 * Extract navPlace features from IIIF Presentation resources and annotate each
 * feature with the resource that supplied it. This keeps map popups tied to the
 * Collection, Manifest, Canvas, or Annotation context instead of reducing the
 * feature to label-only GeoJSON.
 */
export function extractNavPlaceFeatures(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: any,
  options: ExtractNavPlaceFeaturesOptions = {},
): EnrichedNavPlaceFeature[] {
  if (!resource || typeof resource !== "object") return [];

  const rawType = resource.type || resource["@type"];
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  const context = getNavPlaceResourceContext(resource, options.parent);
  const levels = options.levels;
  const shouldInclude =
    typeof type === "string" &&
    isNavPlaceResourceLevel(type) &&
    (!levels?.length || levels.includes(type));

  const features: EnrichedNavPlaceFeature[] = [];

  if (shouldInclude) {
    const featureCollection = normalizeNavPlace(resource.navPlace);
    if (featureCollection?.features?.length) {
      features.push(
        ...featureCollection.features.map((feature) =>
          enrichNavPlaceFeature(feature, context),
        ),
      );
    }
  }

  getChildResources(resource).forEach((child) => {
    features.push(
      ...extractNavPlaceFeatures(child, {
        ...options,
        parent: context ?? options.parent,
      }),
    );
  });

  return features;
}

export function createNavPlaceFeatureCollection(
  features: GeoJSON.Feature[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features,
  };
}
