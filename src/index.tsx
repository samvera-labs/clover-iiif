import Image from "src/components/Image";
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

export {
  Image,
  Primitives,
  Scroll,
  Slider,
  Viewer,
  parseAnnotationTarget,
  type AnnotationTargetExtended,
  createOpenSeadragonRect,
  type Plugin,
  type PluginInformationPanel,
};

export default Viewer;
