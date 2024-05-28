import { CanvasNormalized, Annotation } from "@iiif/presentation-3";
import { ViewerContextStore } from "src/context/viewer-context";

export interface Plugin {
  canvas: CanvasNormalized;
  useViewerDispatch: () => ViewerContextStore;
  useViewerState: () => ViewerContextStore;
}

export interface PluginInformationPanel extends Plugin {
  annotations?: Annotation[];
}
