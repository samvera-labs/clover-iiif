import React from "react";
import { Vault } from "@hyperion-framework/vault";

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

function VaultProvider<VaultProviderProps>({
  initialState = defaultState,
  manifestUri,
  children,
}) {
  const [state, dispatch] = React.useReducer(vaultReducer, initialState);

  React.useEffect(() => {}, []);

  return (
    <VaultStateContext.Provider value={{ manifestUri, vault: new Vault() }}>
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
