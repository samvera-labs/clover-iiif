import React from "react";
import { Vault } from "@hyperion-framework/vault";

const ViewerStateContext = React.createContext();
const ViewerDispatchContext = React.createContext();

const defaultState = {
  activeCanvas: null,
  vault: new Vault(),
  isLoaded: false,
};

function viewerReducer(state, action) {
  switch (action.type) {
    case "updateActiveCanvas": {
      return {
        ...state,
        activeCanvas: action.canvasId,
      };
    }
    case "updateIsLoaded": {
      return {
        ...state,
        isLoaded: { ...action.isLoaded },
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

interface ViewerProviderProps {
  initialState: object;
  manifestId: string;
}

function ViewerProvider<ViewerProviderProps>({
  initialState = defaultState,
  manifestId,
  children,
}) {
  const [state, dispatch] = React.useReducer(viewerReducer, initialState);

  return (
    <ViewerStateContext.Provider
      value={{
        manifestId,
        activeCanvas: state.activeCanvas,
        vault: state.vault,
        isLoaded: state.isLoaded,
      }}
    >
      <ViewerDispatchContext.Provider value={dispatch}>
        {children}
      </ViewerDispatchContext.Provider>
    </ViewerStateContext.Provider>
  );
}

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
