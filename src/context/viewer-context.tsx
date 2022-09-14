import { Options } from "openseadragon";
import React from "react";
import { Vault } from "@iiif/vault";
import { CollectionNormalized } from "@iiif/presentation-3";

export type ConfigOptions = {
  showTitle?: boolean;
  showIIIFBadge?: boolean;
  ignoreCaptionLabels?: string[];
  canvasBackgroundColor?: string;
  canvasHeight?: string;
  openSeadragon?: Options;
};

const defaultConfigOptions = {
  showTitle: true,
  showIIIFBadge: true,
  ignoreCaptionLabels: [],
  canvasBackgroundColor: "#e6e8eb",
  canvasHeight: "61.8vh",
};

interface ViewerContextStore {
  activeCanvas: string;
  activeManifest: string;
  collection?: CollectionNormalized | {};
  configOptions: ConfigOptions;
  isLoaded: boolean;
  vault: Vault;
}

interface ViewerAction {
  type: string;
  canvasId: string;
  collection: CollectionNormalized;
  configOptions: ConfigOptions;
  isLoaded: boolean;
  manifestId: string;
}

const defaultState: ViewerContextStore = {
  activeCanvas: "",
  activeManifest: "",
  collection: {},
  configOptions: defaultConfigOptions,
  isLoaded: false,
  vault: new Vault(),
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
    case "updateCollection": {
      return {
        ...state,
        collection: action.collection,
      };
    }
    case "updateConfigOptions": {
      return {
        ...state,
        configOptions: {
          ...defaultConfigOptions,
          ...action.configOptions,
        },
      };
    }
    case "updateIsLoaded": {
      return {
        ...state,
        isLoaded: action.isLoaded,
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
  const [state, dispatch] = React.useReducer<
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
