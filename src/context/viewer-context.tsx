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
import { AnnotationCollectionNormalized } from "src/types/annotation-collection";
import { deepMerge } from "src/lib/utils";
import type { NavPlaceDisplayLevel } from "src/lib/georef-helpers";
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
  map?: {
    enabled?: boolean;
    fitToData?: boolean;
    navPlaceLevel?: NavPlaceDisplayLevel;
    showImageOverlay?: boolean;
    imageOverlayOpacity?: number;
    showControlPoints?: boolean;
    overlayScope?: "manifest" | "canvas";
  };
  informationPanel?: {
    open?: boolean;
    renderAbout?: boolean;
    renderSupplementing?: boolean;
    renderToggle?: boolean;
    toggleComponent?: React.ComponentType<PanelToggleProps>;
    renderAnnotation?: boolean;
    renderAnnotationCollection?: boolean;
    renderContents?: boolean;
    vtt?: {
      autoScroll?: AutoScrollOptions | AutoScrollSettings | boolean;
    };
    renderContentSearch?: boolean;
    renderCanvasSummary?: boolean;
    defaultTab?: string;
    annotationTabLabel?: string;
    annotationCollectionTabLabel?: string;
  };
  openSeadragon?: OpenSeadragonOptions;
  requestHeaders?: IncomingHttpHeaders;
  showDownload?: boolean;
  showIIIFBadge?: boolean;
  showMediaSearch?: boolean;
  /**
   * Show the resource-type icon on each thumbnail in the canvas rail.
   *
   * Off by default: on a Manifest of scanned pages every thumbnail is an image, so the badge
   * repeats the same glyph down the whole rail without distinguishing anything. Turn it on
   * for mixed Manifests, where knowing which canvases are video or audio is useful. The
   * duration badge on time-based canvases is not governed by this and always shows.
   */
  showResourceIcons?: boolean;
  showTitle?: boolean;
  customLoadingComponent?: React.ComponentType;
  controlButtons?: ControlButtons;
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

/**
 * Everything a control needs in order to work, ready to spread onto a button:
 * the id OpenSeadragon binds to, the accessible name, and the icon. Spreading
 * `buttonProps` keeps the wiring while the element, its shape and its styling
 * stay the consumer's.
 */
export type ControlButtonProps = {
  buttonProps: {
    id: string;
    type: "button";
    "aria-label": string;
    /*
     * Present only on the full-screen control, which Clover drives itself rather than
     * handing to OpenSeadragon. Every other control is still bound by id, so it has no
     * handler to give. A replacement should spread `buttonProps` and not worry which is
     * which.
     */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  };
  icon: React.ReactNode;
  label: string;
};

/**
 * Replacements for the image viewer's controls. Each key is optional, so a
 * consumer can override one control and leave the rest as they are. A
 * replacement owns the whole button, not just the glyph, so it can change shape
 * as well as appearance.
 */
export type ControlButtons = {
  zoomIn?: React.ComponentType<ControlButtonProps>;
  zoomOut?: React.ComponentType<ControlButtonProps>;
  fullPage?: React.ComponentType<ControlButtonProps>;
  rotateRight?: React.ComponentType<ControlButtonProps>;
  rotateLeft?: React.ComponentType<ControlButtonProps>;
  reset?: React.ComponentType<ControlButtonProps>;
};

/**
 * The same arrangement for the information panel toggle. This control is driven
 * by Clover's own state rather than OpenSeadragon, so its props carry the click
 * handler and the expanded state instead of an id.
 */
export type PanelToggleProps = {
  buttonProps: {
    type: "button";
    "aria-label": string;
    "aria-expanded": boolean;
    onClick: () => void;
  };
  icon: React.ReactNode;
  isOpen: boolean;
  label: string;
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
  map: {
    enabled: false,
    fitToData: true,
    navPlaceLevel: "auto",
    showImageOverlay: false,
    imageOverlayOpacity: 0.65,
    showControlPoints: true,
    overlayScope: "manifest",
  },
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
    renderAnnotationCollection: true,
    renderContents: true,
    renderContentSearch: true,
    renderCanvasSummary: false,
  },
  openSeadragon: {},
  requestHeaders: { "Content-Type": "application/json" },
  showDownload: true,
  showIIIFBadge: true,
  showMediaSearch: true,
  showResourceIcons: false,
  showTitle: true,
  withCredentials: false,
};

const cloneViewerConfigOptions = (
  options: ViewerConfigOptions = defaultConfigOptions,
): ViewerConfigOptions => {
  return cloneValue(options) as ViewerConfigOptions;
};

/**
 * React components can be objects rather than functions (`memo`, `forwardRef`),
 * so copying them property by property returns a new object on every clone. The
 * copy still renders, but its changed identity remounts the component, which for
 * an OpenSeadragon control means the viewer keeps its handlers on the discarded
 * element and the button stops working. Treat any component as a leaf.
 */
function isReactComponent(value: object): boolean {
  return "$$typeof" in value;
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object" && isReactComponent(value)) {
    return value;
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
  activeAnnotationId?: string | null;
  activeManifest: string;
  activePlayer: HTMLVideoElement | HTMLAudioElement | null;
  activeSelector?: string | Record<string, unknown>;
  OSDImageLoaded?: boolean;
  annotationCollection?: AnnotationCollectionNormalized;
  pendingAnnotationTarget?: { canvasId: string; annotationId: string } | null;
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
  isMediaPlaying: boolean;
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
  activeAnnotationId?: string | null;
  canvasId: string;
  selector?: string | Record<string, unknown>;
  annotationCollection?: AnnotationCollectionNormalized;
  pendingAnnotationTarget?: { canvasId: string; annotationId: string } | null;
  collection: CollectionNormalized;
  configOptions: ViewerConfigOptions;
  contentStateAnnotation?: AnnotationNormalized;
  informationPanelResource?: string;
  isAutoScrollEnabled: boolean;
  isAutoScrolling: boolean;
  isInformationOpen: boolean;
  isLoaded: boolean;
  isMediaPlaying?: boolean;
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
    const configDefaults = defaultConfigOptions?.informationPanel?.vtt
      ?.autoScroll as AutoScrollOptions;
    return (
      configDefaults || {
        enabled: true,
        settings: defaultAutoScrollSettings,
      }
    );
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
  activeAnnotationId: null,
  activeManifest: "",
  activePlayer: null,
  activeSelector: undefined,
  OSDImageLoaded: false,
  pendingAnnotationTarget: null,
  collection: {},
  configOptions: cloneViewerConfigOptions(),
  customDisplays: [],
  plugins: [],
  isAutoScrollEnabled: expandedAutoScrollOptions.enabled,
  isAutoScrolling: false,
  // Respect explicit false; default to true only when undefined
  isInformationOpen: defaultConfigOptions?.informationPanel?.open ?? true,
  isLoaded: false,
  isMediaPlaying: false,
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

/**
 * Each reducer case reads only the fields its own action carries, so a dispatched
 * action supplies a subset of ViewerAction alongside the required type.
 */
export type ViewerDispatchAction = Partial<ViewerAction> & { type: string };

export type ViewerDispatch = React.Dispatch<ViewerDispatchAction>;

const ViewerStateContext =
  React.createContext<ViewerContextStore>(defaultState);
/*
 * A no-op default, because Image renders OSD without a provider and OSD
 * dispatches on image load. Throwing here would surface inside an
 * OpenSeadragon callback, where nothing can catch it.
 */
const ViewerDispatchContext = React.createContext<ViewerDispatch>(() => {});

function viewerReducer(
  state: ViewerContextStore,
  action: ViewerDispatchAction,
) {
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
    case "updateAnnotationCollection": {
      return {
        ...state,
        annotationCollection: action.annotationCollection,
      };
    }
    case "updatePendingAnnotationTarget": {
      return {
        ...state,
        pendingAnnotationTarget: action.pendingAnnotationTarget,
      };
    }
    case "updateActiveAnnotationId": {
      return {
        ...state,
        activeAnnotationId: action.activeAnnotationId,
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
    case "updateIsMediaPlaying": {
      return {
        ...state,
        isMediaPlaying: action.isMediaPlaying ?? false,
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
  const [state, dispatch] = useReducer(
    viewerReducer,
    initialState,
    (initArg?: ViewerContextStore): ViewerContextStore => {
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

  /*
   * Several reducer cases assign an optional action field to a required store
   * field, so the inferred state widens to include undefined. Narrowing those
   * cases needs its own change.
   */
  return (
    <ViewerStateContext.Provider value={state as ViewerContextStore}>
      <ViewerDispatchContext.Provider value={dispatch}>
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
