import React from "react";
import { Vault } from "@hyperion-framework/vault";
interface ViewerContextStore {
    activeCanvas: string;
    isLoaded: boolean;
    vault: Vault;
}
interface ViewerProviderProps {
    initialState?: ViewerContextStore;
    children: React.ReactNode;
}
declare const ViewerProvider: React.FC<ViewerProviderProps>;
declare function useViewerState(): ViewerContextStore;
declare function useViewerDispatch(): ViewerContextStore;
export { ViewerProvider, useViewerState, useViewerDispatch };
