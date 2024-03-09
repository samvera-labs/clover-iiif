// @ts-nocheck

const Image = require("./image");
const Primitives = require("./primitives");
const Scroll = require("./scroll");
const Slider = require("./slider");
const Viewer = require("./viewer");
const {
  parseAnnotationTarget,
  parseAnnotationsFromAnnotationResources
} = require("./annotation_helpers");
const { createOpenSeadragonRect } = require("./openseadragon-helpers");

module.exports = {
  default: Viewer,
  Image,
  Primitives,
  Scroll,
  Slider,
  Viewer,
  parseAnnotationTarget,
  parseAnnotationsFromAnnotationResources,
  createOpenSeadragonRect
};
