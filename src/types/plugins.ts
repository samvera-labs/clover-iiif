import { CanvasNormalized, Annotation } from "@iiif/presentation-3";
import { ViewerContextStore, ViewerDispatch } from "src/context/viewer-context";

export interface Plugin {
  canvas: CanvasNormalized;
  useViewerDispatch: () => ViewerDispatch;
  useViewerState: () => ViewerContextStore;
}

export interface PluginInformationPanel extends Plugin {
  annotations?: Annotation[];
}
