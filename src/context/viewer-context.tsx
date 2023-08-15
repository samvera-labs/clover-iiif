import { Options as OpenSeadragonOptions } from "openseadragon";
import React, { useReducer } from "react";
import { CollectionNormalized } from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";

export type ViewerConfigOptions = {
  canvasBackgroundColor?: string;
  canvasHeight?: string;
  ignoreCaptionLabels?: string[];
  openSeadragon?: OpenSeadragonOptions;
  renderAbout?: boolean;
  showIIIFBadge?: boolean;
  showInformationToggle?: boolean;
  showTitle?: boolean;
  withCredentials?: boolean;
};

const defaultConfigOptions = {
  canvasBackgroundColor: "#e6e8eb",
  canvasHeight: "61.8vh",
  ignoreCaptionLabels: [],
  openSeadragon: {},
  renderAbout: true,
  showIIIFBadge: true,
  showInformationToggle: true,
  showTitle: true,
  withCredentials: false,
};

interface ViewerContextStore {
  activeCanvas: string;
  activeManifest: string;
  collection?: CollectionNormalized | {};
  configOptions: ViewerConfigOptions;
  informationExpanded: boolean;
  isLoaded: boolean;
  vault: Vault;
}

interface ViewerAction {
  type: string;
  canvasId: string;
  collection: CollectionNormalized;
  configOptions: ViewerConfigOptions;
  informationExpanded: boolean;
  isLoaded: boolean;
  manifestId: string;
  vault: Vault;
}

export const defaultState: ViewerContextStore = {
  activeCanvas: "",
  activeManifest: "",
  collection: {},
  configOptions: defaultConfigOptions,
  informationExpanded: true,
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
    case "updateInformationExpanded": {
      return {
        ...state,
        informationExpanded: action.informationExpanded,
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
