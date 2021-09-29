import React from "react";
import { Vault } from "@hyperion-framework/vault";

const VaultStateContext = React.createContext();
const VaultDispatchContext = React.createContext();

const defaultState = {
  activeCanvas: null,
  vault: new Vault(),
  isLoaded: false,
};

function vaultReducer(state, action) {
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

interface VaultProviderProps {
  initialState: object;
  manifestId: string;
}

function VaultProvider<VaultProviderProps>({
  initialState = defaultState,
  manifestId,
  children,
}) {
  const [state, dispatch] = React.useReducer(vaultReducer, initialState);

  return (
    <VaultStateContext.Provider
      value={{
        manifestId,
        activeCanvas: state.activeCanvas,
        vault: state.vault,
        isLoaded: state.isLoaded,
      }}
    >
      <VaultDispatchContext.Provider value={dispatch}>
        {children}
      </VaultDispatchContext.Provider>
    </VaultStateContext.Provider>
  );
}

function useVaultState() {
  const context = React.useContext(VaultStateContext);
  if (context === undefined) {
    throw new Error("useVaultState must be used within a VaultProvider");
  }
  return context;
}

function useVaultDispatch() {
  const context = React.useContext(VaultDispatchContext);
  if (context === undefined) {
    throw new Error("useVaultDispatch must be used within a VaultProvider");
  }
  return context;
}

export { VaultProvider, useVaultState, useVaultDispatch };
