import React from "react";
import { Content } from "../InformationPanel.styled";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";
import {
  useViewerDispatch,
  useViewerState,
  type PluginConfig,
} from "src/context/viewer-context";
import type { CanvasNormalized } from "@iiif/presentation-3";

interface PluginTabContentProps {
  plugins: PluginConfig[];
  canvas: CanvasNormalized;
}

export const PluginTabContent: React.FC<PluginTabContentProps> = ({
  plugins,
  canvas,
}) => {
  return (
    <>
      {plugins.map((plugin, i) => {
        const PluginComponent = plugin?.informationPanel
          ?.component as unknown as React.ElementType;

        if (PluginComponent === undefined) {
          return null;
        }

        return (
          <Content key={i} value={plugin.id}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <PluginComponent
                {...plugin?.informationPanel?.componentProps}
                canvas={canvas}
                useViewerDispatch={useViewerDispatch}
                useViewerState={useViewerState}
              />
            </ErrorBoundary>
          </Content>
        );
      })}
    </>
  );
};
