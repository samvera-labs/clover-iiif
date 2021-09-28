import React, { useState, useEffect } from "react";
import { Vault } from "@hyperion-framework/vault";
import { ManifestNormalized } from "@hyperion-framework/types";

const VaultStateContext = React.createContext();
const VaultDispatchContext = React.createContext();

const defaultState = {
  activeCanvas: null,
  vault: undefined,
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
    case "updateVault": {
      return {
        ...state,
        vault: { ...action.vault },
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

const vault = new Vault();

function VaultProvider<VaultProviderProps>({
  initialState = defaultState,
  manifestId,
  children,
}) {
  const [state, dispatch] = React.useReducer(vaultReducer, initialState);
  const [loaded, setLoaded] = useState(false);

  vault
    .loadManifest(manifestId)
    .then((data) => {
      console.log(`data`, data);
    })
    .catch((error) => {
      console.error(`Manifest failed to load: ${error}`);
    })
    .finally(() => {
      setLoaded(true);
    });

  return (
    <VaultStateContext.Provider
      value={{ manifestId, activeCanvas: null, vault, isLoaded: loaded }}
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
