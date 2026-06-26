import { parseAnnotationTarget } from "./annotation-helpers";
import { createOpenSeadragonRect } from "./openseadragon-helpers";
import {
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
  getNavPlaceLabel,
  isGeoreferenceAnnotation,
  normalizeNavPlace,
  parseGeoreferenceAnnotation,
} from "./georef-helpers";

export {
  parseAnnotationTarget,
  createOpenSeadragonRect,
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
  getNavPlaceLabel,
  isGeoreferenceAnnotation,
  normalizeNavPlace,
  parseGeoreferenceAnnotation,
};
export type {
  GeoreferenceAnnotation,
  GeoreferenceAnnotationSource,
  GroundControlPoint,
  NavPlaceDisplayLevel,
  NavPlaceGeoJSON,
  NavPlaceResourceContext,
  NavPlaceResourceLevel,
} from "./georef-helpers";

const helpers = {
  parseAnnotationTarget,
  createOpenSeadragonRect,
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
  getNavPlaceLabel,
  isGeoreferenceAnnotation,
  normalizeNavPlace,
  parseGeoreferenceAnnotation,
};
export default helpers;
