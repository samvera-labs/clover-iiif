import {
  CollectionNormalized,
  InternationalString,
  Reference,
} from "@iiif/presentation-3";
import OpenSeadragon, { Options as OpenSeadragonOptions } from "openseadragon";
import React, { MediaHTMLAttributes, useReducer } from "react";

import { IncomingHttpHeaders } from "http";
import { Vault } from "@iiif/helpers/vault";
import { deepMerge } from "src/lib/utils";
import { v4 as uuidv4 } from "uuid";

export type AutoScrollSettings = {
  behavior: string; // ScrollBehavior ("auto" | "instant" | "smooth")
  block: string; // ScrollLogicalPosition ("center" | "end" | "nearest" | "start")
};

export type AutoScrollOptions = {
  enabled: boolean;
  settings: AutoScrollSettings;
};

export type ViewerConfigOptions = {
  annotationOverlays?: OverlayOptions;
  background?: string;
  canvasBackgroundColor?: string;
  canvasHeight?: string;
  contentSearch?: {
    searchResultsLimit?: number;
    overlays?: OverlayOptions;
  };
  crossOrigin?: MediaHTMLAttributes<HTMLVideoElement>["crossOrigin"];
  ignoreCaptionLabels?: string[];
  informationPanel?: {
    open?: boolean;
    renderAbout?: boolean;
    renderSupplementing?: boolean;
    renderToggle?: boolean;
    renderAnnotation?: boolean;
    vtt?: {
      autoScroll?: AutoScrollOptions | AutoScrollSettings | boolean;
    };
    renderContentSearch?: boolean;
    defaultTab?: string;
  };
  openSeadragon?: OpenSeadragonOptions;
  requestHeaders?: IncomingHttpHeaders;
  showDownload?: boolean;
  showIIIFBadge?: boolean;
  showTitle?: boolean;
  customLoadingComponent?: React.ComponentType;
  withCredentials?: boolean;
  localeText?: {
    contentSearch?: {
      tabLabel?: string;
      formPlaceholder?: string;
      noSearchResults?: string;
      loading?: string;
      moreResults?: string;
    };
  };
};

export type OverlayOptions = {
  backgroundColor?: string;
  borderColor?: string;
  borderType?: string;
  borderWidth?: string;
  opacity?: string;
  renderOverlays?: boolean;
  zoomLevel?: number;
};

const defaultAutoScrollSettings: AutoScrollSettings = {
  behavior: "smooth",
  block: "center",
};

const defaultConfigOptions = {
  annotationOverlays: {
    backgroundColor: "#6666ff",
    borderColor: "#000099",
    borderType: "solid",
    borderWidth: "1px",
    opacity: "0.5",
    renderOverlays: true,
    zoomLevel: 2,
  },
  background: "transparent",
  canvasBackgroundColor: "#6662",
  canvasHeight: "500px",
  contentSearch: {
    searchResultsLimit: 20,
    overlays: {
      backgroundColor: "#ff6666",
      borderColor: "#990000",
      borderType: "solid",
      borderWidth: "1px",
      opacity: "0.5",
      renderOverlays: true,
      zoomLevel: 4,
    },
  },
  crossOrigin: undefined,
  ignoreCaptionLabels: [],
  informationPanel: {
    vtt: {
      autoScroll: {
        enabled: true,
        settings: defaultAutoScrollSettings,
      },
    },
    open: true,
    renderAbout: true,
    renderSupplementing: true,
    renderToggle: true,
    renderAnnotation: true,
    renderContentSearch: true,
  },
  openSeadragon: {},
  requestHeaders: { "Content-Type": "application/json" },
  showDownload: true,
  showIIIFBadge: true,
  showTitle: true,
  withCredentials: false,
};

export type CustomDisplay = {
  display: {
    component: React.ElementType;
    componentProps?: Record<string, unknown>;
  };
  target: {
    canvasId?: string[];
    paintingFormat?: string[];
  };
};
export type PluginConfig = {
  id: string;
  imageViewer?: {
    controls?: {
      component: React.ElementType;
      componentProps?: Record<string, unknown>;
    };
  };
  informationPanel?: {
    component: React.ElementType;
    componentProps?: Record<string, unknown>;
    label: InternationalString;
  };
};

export interface ViewerContextStore {
  activeCanvas: string;
  activeManifest: string;
  activeSelector?: string;
  OSDImageLoaded?: boolean;
  collection?: CollectionNormalized | Record<string, never>;
  configOptions: ViewerConfigOptions;
  customDisplays: Array<CustomDisplay>;
  plugins: Array<PluginConfig>;
  informationPanelResource?: string;
  isAutoScrollEnabled?: boolean;
  isAutoScrolling?: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isUserScrolling?: number | undefined;
  sequence: [Reference<"Canvas">[], number[][]];
  vault: Vault;
  openSeadragonViewer: OpenSeadragon.Viewer | null;
  openSeadragonId?: string;
  viewerId?: string;
  visibleCanvases: Array<Reference<"Canvas">>;
  visibleAnnotations?: Array<Reference<"Annotation">>;
}

export interface ViewerAction {
  type: string;
  canvasId: string;
  selector?: string;
  collection: CollectionNormalized;
  configOptions: ViewerConfigOptions;
  informationPanelResource?: string;
  isAutoScrollEnabled: boolean;
  isAutoScrolling: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isUserScrolling: number | undefined;
  manifestId: string;
  OSDImageLoaded?: boolean;
  sequence: [Reference<"Canvas">[], number[][]];
  vault: Vault;
  openSeadragonViewer: OpenSeadragon.Viewer;
  viewerId: string;
  visibleCanvases: Array<Reference<"Canvas">>;
}

export function expandAutoScrollOptions(
  value: AutoScrollOptions | AutoScrollSettings | boolean | undefined,
): AutoScrollOptions {
  let result: AutoScrollOptions = {
    ...defaultConfigOptions.informationPanel.vtt.autoScroll,
  };
  if (typeof value === "object") {
    result = "enabled" in value ? value : { enabled: true, settings: value };
  }
  if (value === false) result.enabled = false;
  validateAutoScrollSettings(result.settings);
  return result;
}

function validateAutoScrollSettings({ behavior, block }: AutoScrollSettings) {
  const validBehaviors = ["auto", "instant", "smooth"];
  const validPositions = ["center", "end", "nearest", "start"];
  if (!validBehaviors.includes(behavior))
    throw TypeError(`'${behavior}' not in ${validBehaviors.join(" | ")}`);
  if (!validPositions.includes(block))
    throw TypeError(`'${block}' not in ${validPositions.join(" | ")}`);
}

const expandedAutoScrollOptions = expandAutoScrollOptions(
  defaultConfigOptions?.informationPanel?.vtt?.autoScroll,
);

export const defaultState: ViewerContextStore = {
  activeCanvas: "",
  activeManifest: "",
  activeSelector: undefined,
  OSDImageLoaded: false,
  collection: {},
  configOptions: defaultConfigOptions,
  customDisplays: [],
  plugins: [],
  isAutoScrollEnabled: expandedAutoScrollOptions.enabled,
  isAutoScrolling: false,
  isInformationOpen: defaultConfigOptions?.informationPanel?.open,
  isLoaded: false,
  isUserScrolling: undefined,
  sequence: [[], []],
  vault: new Vault(),
  openSeadragonViewer: null,
  viewerId: uuidv4(),
  visibleCanvases: [],
  visibleAnnotations: [],
};

const ViewerStateContext =
  React.createContext<ViewerContextStore>(defaultState);
const ViewerDispatchContext =
  React.createContext<ViewerContextStore>(defaultState);

function viewerReducer(state: ViewerContextStore, action: ViewerAction) {
  switch (action.type) {
    case "updateActiveCanvas": {
      /**
       * Set canvasId to empty string if it comes back undefined.
       */
      if (!action.canvasId) action.canvasId = "";
      return {
        ...state,
        activeCanvas: action.canvasId,
      };
    }
    case "updateActiveManifest": {
      return {
        ...state,
        activeManifest: action.manifestId,
      };
    }
    case "updateOSDImageLoaded": {
      return {
        ...state,
        OSDImageLoaded: action.OSDImageLoaded,
      };
    }
    case "updateAutoScrollAnnotationEnabled": {
      return {
        ...state,
        isAutoScrollEnabled: action.isAutoScrollEnabled,
      };
    }
    case "updateAutoScrolling": {
      return {
        ...state,
        isAutoScrolling: action.isAutoScrolling,
      };
    }
    case "updateCollection": {
      return {
        ...state,
        collection: action.collection,
      };
    }
    case "updateConfigOptions": {
      return {
        ...state,
        configOptions: deepMerge(state.configOptions, action.configOptions),
      };
    }
    case "updateInformationOpen": {
      return {
        ...state,
        isInformationOpen: action.isInformationOpen,
      };
    }
    case "updateInformationPanelResource": {
      return {
        ...state,
        informationPanelResource: action.informationPanelResource,
      };
    }
    case "updateIsLoaded": {
      return {
        ...state,
        isLoaded: action.isLoaded,
      };
    }
    case "updateManifestSequence": {
      return {
        ...state,
        sequence: action.sequence,
      };
    }
    case "updateUserScrolling": {
      return {
        ...state,
        isUserScrolling: action.isUserScrolling,
      };
    }
    case "updateOpenSeadragonViewer": {
      return {
        ...state,
        openSeadragonViewer: action.openSeadragonViewer,
      };
    }
    case "updateViewerId": {
      return {
        ...state,
        viewerId: action.viewerId,
      };
    }
    case "updateActiveSelector": {
      return {
        ...state,
        activeSelector: action.selector,
      };
    }
    case "updateVisibleCanvases": {
      return {
        ...state,
        visibleCanvases: action.visibleCanvases,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

interface ViewerProviderProps {
  initialState?: ViewerContextStore;
  children: React.ReactNode;
}

const ViewerProvider: React.FC<ViewerProviderProps> = ({
  initialState = defaultState,
  children,
}) => {
  const [state, dispatch] = useReducer<
    React.Reducer<ViewerContextStore, ViewerAction>
  >(viewerReducer, initialState);

  return (
    <ViewerStateContext.Provider value={state}>
      <ViewerDispatchContext.Provider
        value={dispatch as unknown as ViewerContextStore}
      >
        {children}
      </ViewerDispatchContext.Provider>
    </ViewerStateContext.Provider>
  );
};

function useViewerState() {
  const context = React.useContext(ViewerStateContext);
  if (context === undefined) {
    throw new Error("useViewerState must be used within a ViewerProvider");
  }
  return context;
}

function useViewerDispatch() {
  const context = React.useContext(ViewerDispatchContext);
  if (context === undefined) {
    throw new Error("useViewerDispatch must be used within a ViewerProvider");
  }
  return context;
}

export { ViewerProvider, useViewerState, useViewerDispatch };
