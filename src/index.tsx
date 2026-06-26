import Image from "src/components/Image";
import Map from "src/components/Map";
import Primitives from "src/components/Primitives";
import Scroll from "src/components/Scroll";
import Slider from "src/components/Slider";
import Viewer from "src/components/Viewer";
import {
  parseAnnotationTarget,
  type AnnotationTargetExtended,
} from "src/lib/annotation-helpers";
import { createOpenSeadragonRect } from "src/lib/openseadragon-helpers";
import { type Plugin, type PluginInformationPanel } from "src/types/plugins";
import type {
  CloverMapProps,
  MapCenter,
  MapMarker,
  MapTileLayer,
} from "src/components/Map";
import {
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
  isGeoreferenceAnnotation,
} from "src/lib/georef-helpers";
import type {
  GeoreferenceAnnotation,
  GeoreferenceAnnotationSource,
  GroundControlPoint,
  NavPlaceDisplayLevel,
  NavPlaceGeoJSON,
  NavPlaceResourceContext,
  NavPlaceResourceLevel,
} from "src/lib/georef-helpers";

const helpers = {
  parseAnnotationTarget,
  createOpenSeadragonRect,
};

export {
  Image,
  Map,
  Primitives,
  Scroll,
  Slider,
  Viewer,
  helpers,
  adaptGeoreferenceAnnotationForOverlay,
  createNavPlaceFeatureCollection,
  extractNavPlaceFeatures,
  getImageServiceId,
  isGeoreferenceAnnotation,
  type AnnotationTargetExtended,
  type CloverMapProps,
  type GeoreferenceAnnotation,
  type GeoreferenceAnnotationSource,
  type GroundControlPoint,
  type MapCenter,
  type MapMarker,
  type MapTileLayer,
  type NavPlaceDisplayLevel,
  type NavPlaceGeoJSON,
  type NavPlaceResourceContext,
  type NavPlaceResourceLevel,
  type Plugin,
  type PluginInformationPanel,
};

export default Viewer;
