import {
  AnnotationNormalized,
  CollectionNormalized,
  InternationalString,
  Reference,
} from "@iiif/presentation-3";
import OpenSeadragon, { Options as OpenSeadragonOptions } from "openseadragon";
import React, { MediaHTMLAttributes, useEffect, useReducer } from "react";

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
  annotations?: {
    motivations?: string[];
  };
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
    annotationTabLabel?: string;
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

const defaultConfigOptions: ViewerConfigOptions = {
  annotationOverlays: {
    backgroundColor: "#6666ff",
    borderColor: "#000099",
    borderType: "solid",
    borderWidth: "1px",
    opacity: "0.5",
    renderOverlays: true,
    zoomLevel: 2,
  },
  annotations: {
    motivations: undefined,
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
  crossOrigin: "anonymous",
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

const cloneViewerConfigOptions = (
  options: ViewerConfigOptions = defaultConfigOptions,
): ViewerConfigOptions => {
  return cloneValue(options) as ViewerConfigOptions;
};

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, val]) => {
        acc[key] = cloneValue(val);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  return value;
}

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

export type ViewingDirection =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top";

export interface ViewerContextStore {
  activeCanvas: string;
  activeManifest: string;
  activePlayer: HTMLVideoElement | HTMLAudioElement | null;
  activeSelector?: string;
  OSDImageLoaded?: boolean;
  collection?: CollectionNormalized | Record<string, never>;
  contentStateAnnotation?: AnnotationNormalized;
  configOptions: ViewerConfigOptions;
  customDisplays: Array<CustomDisplay>;
  plugins: Array<PluginConfig>;
  informationPanelResource?: string;
  isAutoScrollEnabled?: boolean;
  isAutoScrolling?: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isPaged: boolean;
  isUserScrolling?: number | undefined;
  sequence: [Reference<"Canvas">[], number[][]];
  vault: Vault;
  viewingDirection: ViewingDirection;
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
  contentStateAnnotation?: AnnotationNormalized;
  informationPanelResource?: string;
  isAutoScrollEnabled: boolean;
  isAutoScrolling: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isPaged: boolean;
  isUserScrolling: number | undefined;
  manifestId: string;
  OSDImageLoaded?: boolean;
  player: HTMLVideoElement | HTMLAudioElement | null;
  sequence: [Reference<"Canvas">[], number[][]];
  vault: Vault;
  viewingDirection: ViewingDirection;
  openSeadragonViewer: OpenSeadragon.Viewer;
  viewerId: string;
  visibleCanvases: Array<Reference<"Canvas">>;
}

export function expandAutoScrollOptions(
  value: AutoScrollOptions | AutoScrollSettings | boolean | undefined,
): AutoScrollOptions {
  // Get safe defaults, avoiding potential undefined values
  const getDefaults = (): AutoScrollOptions => {
    const configDefaults = defaultConfigOptions?.informationPanel?.vtt?.autoScroll as AutoScrollOptions;
    return configDefaults || {
      enabled: true,
      settings: defaultAutoScrollSettings,
    };
  };

  const defaults = getDefaults();

  // Handle each input type explicitly
  if (value === undefined || value === null) {
    return {
      enabled: defaults.enabled,
      settings: { ...defaults.settings },
    };
  }

  if (typeof value === "boolean") {
    return {
      enabled: value,
      settings: { ...defaults.settings },
    };
  }

  // Handle object types: AutoScrollOptions vs AutoScrollSettings
  if ("enabled" in value) {
    // It's AutoScrollOptions - use both enabled flag and settings
    const options = value as AutoScrollOptions;
    return {
      enabled: options.enabled,
      settings: { ...options.settings },
    };
  }

  // It's AutoScrollSettings - enable auto-scroll and use provided settings
  const settings = value as AutoScrollSettings;
  const result = {
    enabled: true,
    settings: { ...settings },
  };

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

export const createDefaultState = (): ViewerContextStore => ({
  activeCanvas: "",
  activeManifest: "",
  activePlayer: null,
  activeSelector: undefined,
  OSDImageLoaded: false,
  collection: {},
  configOptions: cloneViewerConfigOptions(),
  customDisplays: [],
  plugins: [],
  isAutoScrollEnabled: expandedAutoScrollOptions.enabled,
  isAutoScrolling: false,
  // Respect explicit false; default to true only when undefined
  isInformationOpen: defaultConfigOptions?.informationPanel?.open ?? true,
  isLoaded: false,
  isPaged: false,
  isUserScrolling: undefined,
  sequence: [[], []],
  vault: new Vault(),
  viewingDirection: "left-to-right",
  openSeadragonViewer: null,
  viewerId: uuidv4(),
  visibleCanvases: [],
  visibleAnnotations: [],
});

export const defaultState: ViewerContextStore = createDefaultState();

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
    case "updateActivePlayer": {
      return {
        ...state,
        activePlayer: action.player,
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
      const mergedConfigOptions = deepMerge(
        cloneViewerConfigOptions(state.configOptions),
        action.configOptions,
      );
      return {
        ...state,
        configOptions: mergedConfigOptions,
      };
    }
    case "updateContentStateAnnotation": {
      return {
        ...state,
        contentStateAnnotation: action.contentStateAnnotation,
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
    case "updateViewingDirection": {
      return {
        ...state,
        viewingDirection: action.viewingDirection,
      };
    }
    case "updateIsPaged": {
      return {
        ...state,
        isPaged: action.isPaged,
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
  initialState,
  children,
}) => {
  const [state, dispatch] = useReducer<
    React.Reducer<ViewerContextStore, ViewerAction>,
    ViewerContextStore | undefined
  >(
    viewerReducer,
    initialState,
    (initArg?: ViewerContextStore) => {
      if (initArg) {
        return {
          ...initArg,
          configOptions: cloneViewerConfigOptions(
            initArg.configOptions ?? defaultConfigOptions,
          ),
          viewerId: initArg.viewerId ?? uuidv4(),
        };
      }

      return createDefaultState();
    },
  );

  const { openSeadragonViewer } = state;

  useEffect(() => {
    if (openSeadragonViewer) {
      openSeadragonViewer.addHandler("update-viewport", () => {
        const osd = openSeadragonViewer.viewport;
        const bounds = osd.getBounds();
        const rect = osd.viewportToImageRectangle(bounds);

        // for each value, round to the nearest integer
        const xywh = [
          Math.round(rect.x),
          Math.round(rect.y),
          Math.round(rect.width),
          Math.round(rect.height),
        ];

        const value = `xywh=${xywh.join(",")}`;
        dispatch({
          type: "updateActiveSelector",
          // @ts-ignore
          selector: {
            type: "FragmentSelector",
            value,
          },
        });
      });

      return () => {
        openSeadragonViewer.removeAllHandlers("update-viewport");
      };
    }
  }, [openSeadragonViewer]);

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
