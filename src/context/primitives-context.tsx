import { createContext, useContext } from "react";

import React from "react";

type PrimitivesContextStore =
  | {
      delimiter: string; // Separator for multi-value items
    }
  | undefined;
interface ProviderProps {
  children: React.ReactNode;
  initialState?: PrimitivesContextStore;
}

const defaultState = {
  delimiter: ", ",
};

const PrimitivesContext = createContext<PrimitivesContextStore>(undefined);

const usePrimitivesContext = () => {
  const context = useContext(PrimitivesContext);
  if (context === undefined) {
    throw new Error(
      "usePrimitivesContext must be used with a PrimitivesProvider",
    );
  }
  return context;
};

const PrimitivesProvider: React.FC<ProviderProps> = ({
  children,
  initialState = defaultState,
}) => {
  const delimiter = getRealPropertyValue(initialState, "delimiter");

  return (
    <PrimitivesContext.Provider value={{ delimiter }}>
      {children}
    </PrimitivesContext.Provider>
  );
};

const getRealPropertyValue = (
  obj: { [key: string]: any },
  property: string,
) => {
  const value = Object.hasOwn(obj, property)
    ? obj[property].toString()
    : undefined;
  return value;
};

export {
  PrimitivesContext,
  PrimitivesProvider,
  getRealPropertyValue,
  usePrimitivesContext,
};
