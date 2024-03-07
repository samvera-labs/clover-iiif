import OpenSeadragon, { Options as OpenSeadragonOptions } from "openseadragon";
import React, { useReducer } from "react";

import {
  CollectionNormalized,
  InternationalString,
} from "@iiif/presentation-3";
import { IncomingHttpHeaders } from "http";
import { Vault } from "@iiif/vault";
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
  annotationOverlays?: {
    backgroundColor?: string;
    borderColor?: string;
    borderType?: string;
    borderWidth?: string;
    opacity?: string;
    renderOverlays?: boolean;
    zoomLevel?: number;
  };
  background?: string;
  canvasBackgroundColor?: string;
  canvasHeight?: string;
  ignoreCaptionLabels?: string[];
  ignoreAnnotationOverlaysLabels?: string[];
  informationPanel?: {
    open?: boolean;
    renderAbout?: boolean;
    renderSupplementing?: boolean;
    renderToggle?: boolean;
    renderAnnotation?: boolean;
    vtt?: {
      autoScroll?: AutoScrollOptions | AutoScrollSettings | boolean;
    };
  };
  openSeadragon?: OpenSeadragonOptions;
  requestHeaders?: IncomingHttpHeaders;
  showDownload?: boolean;
  showIIIFBadge?: boolean;
  showTitle?: boolean;
  withCredentials?: boolean;
};

const defaultAutoScrollSettings: AutoScrollSettings = {
  behavior: "smooth",
  block: "center",
};

const defaultConfigOptions = {
  annotationOverlays: {
    backgroundColor: "#ff6666",
    borderColor: "#990000",
    borderType: "solid",
    borderWidth: "1px",
    opacity: "0.5",
    renderOverlays: true,
    zoomLevel: 2,
  },
  background: "transparent",
  canvasBackgroundColor: "#6662",
  canvasHeight: "500px",
  ignoreCaptionLabels: [],
  ignoreAnnotationOverlaysLabels: [],
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
export type Plugin = {
  id: string;
  component: React.ElementType;
  componentProps?: Record<string, unknown>;
  informationPanel?: {
    component: React.ElementType;
    componentProps?: Record<string, unknown>;
    label?: InternationalString;
  };
};

export interface ViewerContextStore {
  activeCanvas: string;
  activeManifest: string;
  collection?: CollectionNormalized | Record<string, never>;
  configOptions: ViewerConfigOptions;
  customDisplays: Array<CustomDisplay>;
  plugins: Array<Plugin>;
  isAutoScrollEnabled?: boolean;
  isAutoScrolling?: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isUserScrolling?: number | undefined;
  vault: Vault;
  openSeadragonViewer: OpenSeadragon.Viewer | null;
  openSeadragonId?: string;
  viewerId?: string;
}

export interface ViewerAction {
  type: string;
  canvasId: string;
  collection: CollectionNormalized;
  configOptions: ViewerConfigOptions;
  isAutoScrollEnabled: boolean;
  isAutoScrolling: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isUserScrolling: number | undefined;
  manifestId: string;
  vault: Vault;
  openSeadragonViewer: OpenSeadragon.Viewer;
  viewerId: string;
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
  collection: {},
  configOptions: defaultConfigOptions,
  customDisplays: [],
  plugins: [],
  isAutoScrollEnabled: expandedAutoScrollOptions.enabled,
  isAutoScrolling: false,
  isInformationOpen: defaultConfigOptions?.informationPanel?.open,
  isLoaded: false,
  isUserScrolling: undefined,
  vault: new Vault(),
  openSeadragonViewer: null,
  viewerId: uuidv4(),
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
    case "updateIsLoaded": {
      return {
        ...state,
        isLoaded: action.isLoaded,
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
