import React, { useReducer } from "react";

export type ConfigOptions = {
  showToolbar?: boolean;
  showAnnotations?: boolean;
};

const defaultConfigOptions: ConfigOptions = {
  showToolbar: false,
  showAnnotations: true,
};

interface CreateAnnotationContextStore {
  configOptions: ConfigOptions;
}

interface CreateAnnotationAction {
  type: string;
  configOptions: ConfigOptions;
}

export const defaultState: CreateAnnotationContextStore = {
  configOptions: defaultConfigOptions,
};

const CreateAnnotationStateContext =
  React.createContext<CreateAnnotationContextStore>(defaultState);
const CreateAnnotationDispatchContext =
  React.createContext<CreateAnnotationContextStore>(defaultState);

function createAnnotationReducer(
  state: CreateAnnotationContextStore,
  action: CreateAnnotationAction,
) {
  switch (action.type) {
    case "updateConfigOptions": {
      return {
        ...state,
        configOptions: {
          ...defaultConfigOptions,
          ...action.configOptions,
        },
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

interface CreateAnnotationProviderProps {
  initialState?: CreateAnnotationContextStore;
  children: React.ReactNode;
}

const CreateAnnotationProvider: React.FC<CreateAnnotationProviderProps> = ({
  initialState = defaultState,
  children,
}) => {
  const [state, dispatch] = useReducer<
    React.Reducer<CreateAnnotationContextStore, CreateAnnotationAction>
  >(createAnnotationReducer, initialState);

  return (
    <CreateAnnotationStateContext.Provider value={state}>
      <CreateAnnotationDispatchContext.Provider
        value={dispatch as unknown as CreateAnnotationContextStore}
      >
        {children}
      </CreateAnnotationDispatchContext.Provider>
    </CreateAnnotationStateContext.Provider>
  );
};

function useCreateAnnotationState() {
  const context = React.useContext(CreateAnnotationStateContext);
  if (context === undefined) {
    throw new Error(
      "useCreateAnnotationState must be used within a CreateAnnotationProvider",
    );
  }
  return context;
}

function useCreateAnnotationDispatch() {
  const context = React.useContext(CreateAnnotationDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useCreateAnnotationDispatch must be used within a CreateAnnotationProvider",
    );
  }
  return context;
}

export {
  CreateAnnotationProvider,
  useCreateAnnotationState,
  useCreateAnnotationDispatch,
};
