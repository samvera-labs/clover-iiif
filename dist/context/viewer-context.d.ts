import React from "react";
import { Vault } from "@iiif/vault";
export declare type ConfigOptions = {
    showTitle: boolean;
    showIIIFBadge: boolean;
    ignoreCaptionLabels: string[];
};
interface ViewerContextStore {
    activeCanvas: string;
    configOptions: ConfigOptions;
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
