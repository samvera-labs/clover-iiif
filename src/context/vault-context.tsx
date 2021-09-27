import React, { useState, useEffect } from "react";
import { Vault } from "@hyperion-framework/vault";
import { Manifest, ManifestNormalized } from "@hyperion-framework/types";

const VaultStateContext = React.createContext();
const VaultDispatchContext = React.createContext();

const defaultState = {
  activeMedia: null,
  vault: undefined,
};

function vaultReducer(state, action) {
  switch (action.type) {
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
  manifestUri: string;
}

const vault = new Vault();

function VaultProvider<VaultProviderProps>({
  initialState = defaultState,
  manifestUri,
  children,
}) {
  const [state, dispatch] = React.useReducer(vaultReducer, initialState);

  const [manifest, setManifest] = useState<ManifestNormalized | undefined>();
  const [loaded, setLoaded] = useState(false);

  vault
    .loadManifest(manifestUri)
    .then((data) => {
      setManifest(data);
      setLoaded(true);
    })
    .catch((error) => {
      console.error(`Manifest failed to load: ${error}`);
    });

  if (typeof manifest !== "undefined") {
    return (
      <VaultStateContext.Provider value={{ manifestUri, vault }}>
        <VaultDispatchContext.Provider value={dispatch}>
          {children}
        </VaultDispatchContext.Provider>
      </VaultStateContext.Provider>
    );
  }

  return null;
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
