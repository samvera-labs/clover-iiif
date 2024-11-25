import { AnnotationNormalized, ManifestNormalized } from "@iiif/presentation-3";
import React, { Dispatch, createContext, useReducer } from "react";

import { Vault } from "@iiif/helpers/vault";

type LanguageOption = {
  [key: string]: string; // Keys and values are dynamically defined
};

interface StateType {
  activeLanguages?: string[];
  annotations?: AnnotationNormalized[];
  manifest?: ManifestNormalized;
  options: {
    offset: number;
    figure: {
      display: "thumbnail" | "image-viewer";
      aspectRatio?: number;
      width?: CSSStyleDeclaration["width"];
    };
    language?: {
      defaultLanguages?: string[];
      enabled: boolean;
      options?: LanguageOption[];
    };
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

export const initialState: StateType = {
  activeLanguages: undefined,
  annotations: [],
  manifest: undefined,
  options: {
    offset: 0,
    figure: {
      display: "image-viewer",
      aspectRatio: 100 / 61.8, // golden ratio
      width: "38.2%",
    },
    language: {
      defaultLanguages: undefined,
      enabled: false,
      options: [],
    },
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
    case "updateActiveLanguages":
      return {
        ...state,
        activeLanguages: action.payload,
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
  activeLanguages?: string[];
  annotations?: AnnotationNormalized[];
  children: React.ReactNode;
  manifest?: ManifestNormalized;
  options?: StateType["options"];
  vault?: Vault;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = (props) => {
  const { children, manifest } = props;
  const options = {
    ...initialState.options,
    ...props.options,
  };

  // Dynamically set the initial activeLanguages based on options.language.defaultLanguages
  const initialActiveLanguages = options.language?.defaultLanguages || [];

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    activeLanguages: initialActiveLanguages,
    options,
  });

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
