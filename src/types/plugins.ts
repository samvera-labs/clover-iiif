import { CanvasNormalized, Annotation } from "@iiif/presentation-3";
import {
  ViewerContextStore,
  ViewerConfigOptions,
} from "src/context/viewer-context";

export interface Plugin {
  activeManifest: string;
  canvas: CanvasNormalized;
  viewerConfigOptions: ViewerConfigOptions;
  openSeadragonViewer: OpenSeadragon.Viewer | null;
  useViewerDispatch: () => ViewerContextStore;
  useViewerState: () => ViewerContextStore;
}

export interface PluginInformationPanel extends Plugin {
  annotations?: Annotation[];
}
