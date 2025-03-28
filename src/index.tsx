import Image from "src/components/Image";
import Primitives from "src/components/Primitives";
import Scroll from "src/components/Scroll";
import Share from "src/components/Share";
import Slider from "src/components/Slider";
import Viewer from "src/components/Viewer";
import {
  parseAnnotationTarget,
  type AnnotationTargetExtended,
} from "src/lib/annotation-helpers";
import { createOpenSeadragonRect } from "src/lib/openseadragon-helpers";
import { type Plugin, type PluginInformationPanel } from "src/types/plugins";

const helpers = {
  parseAnnotationTarget,
  createOpenSeadragonRect,
};

export {
  Image,
  Primitives,
  Scroll,
  Share,
  Slider,
  Viewer,
  helpers,
  type AnnotationTargetExtended,
  type Plugin,
  type PluginInformationPanel,
};

export default Viewer;
