import { AnnotationNormalized, ManifestNormalized } from "@iiif/presentation-3";
import React, { Dispatch, createContext, useReducer } from "react";

import { Vault } from "@iiif/helpers/vault";

interface StateType {
  annotations?: AnnotationNormalized[];
  manifest?: ManifestNormalized;
  options: {
    offset: number;
  };
  searchActiveMatch?: string;
  searchMatches?: {
    matches: {
      [key: string]: string[];
    };
    total: number;
  };
  searchString?: string;
  vault?: Vault;
}

interface ActionType {
  payload?: any;
  type: string;
}

const initialState: StateType = {
  annotations: [],
  manifest: undefined,
  options: {
    offset: 0,
  },
  searchActiveMatch: undefined,
  searchMatches: undefined,
  searchString: undefined,
  vault: new Vault(),
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "updateAnnotations":
      return {
        ...state,
        annotations: action.payload,
      };
    case "updateSearchActiveMatch":
      return {
        ...state,
        searchActiveMatch: action.payload,
      };
    case "updateSearchMatches":
      return {
        ...state,
        searchMatches: action.payload,
      };
    case "updateSearchString":
      return {
        ...state,
        searchString: action.payload,
      };
    default:
      return state;
  }
}

export const ScrollContext = createContext<{
  dispatch: Dispatch<ActionType>;
  state: StateType;
}>({
  dispatch: () => null,
  state: initialState,
});

interface ScrollProviderProps {
  annotations?: AnnotationNormalized[];
  children: React.ReactNode;
  manifest?: ManifestNormalized;
  options?: {
    offset?: number;
  };
  vault?: Vault;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = (props) => {
  const { children, manifest } = props;
  const options = {
    ...initialState.options,
    ...props.options,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ScrollContext.Provider
      value={{
        state: { ...state, manifest, options },
        dispatch,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
