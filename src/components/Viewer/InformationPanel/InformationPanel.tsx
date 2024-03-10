import {
  Content,
  List,
  Scroll,
  Trigger,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React, { useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
  type PluginConfig,
} from "src/context/viewer-context";

import AnnotationPage from "src/components/Viewer/InformationPanel/Annotation/Page";
import { AnnotationResources } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import { InternationalString, CanvasNormalized } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { setupPlugins, formatPluginAnnotations } from "src/lib/plugin-helpers";
import ErrorFallback from "../Viewer/ErrorFallback";

import { ErrorBoundary } from "react-error-boundary";

const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

interface NavigatorProps {
  activeCanvas: string;
  annotationResources?: AnnotationResources;
}

export const InformationPanel: React.FC<NavigatorProps> = ({
  activeCanvas,
  annotationResources,
}) => {
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    isAutoScrolling,
    isUserScrolling,
    vault,
    openSeadragonViewer,
    configOptions,
    plugins,
    activeManifest,
  } = viewerState;
  const { informationPanel } = configOptions;

  const [activeResource, setActiveResource] = useState<string>();

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;
  let canvas: CanvasNormalized;
  try {
    canvas = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });
  } catch (error) {
    console.error(error);
  }

  const { pluginsWithInfoPanel, pluginsAnnotationPageIds } =
    setupPlugins(plugins);

  function renderPluginLabel(plugin: PluginConfig, i: number) {
    const annotations = formatPluginAnnotations(plugin, annotationResources);
    if (
      annotations.length === 0 &&
      plugin.informationPanel?.displayIfNoAnnotations === false
    ) {
      return <></>;
    }

    const label = plugin.informationPanel?.label || { none: [plugin.id] };

    return (
      <Trigger key={i} value={plugin.id}>
        <Label label={label} />
      </Trigger>
    );
  }

  function renderPluginInformationPanel(plugin: PluginConfig, i: number) {
    const PluginInformationPanelComponent = plugin?.informationPanel
      ?.component as unknown as React.ElementType;

    if (PluginInformationPanelComponent === undefined) {
      return <></>;
    }

    const annotations = formatPluginAnnotations(
      plugin,
      annotationResources,
      vault,
    );

    if (
      annotations.length === 0 &&
      plugin.informationPanel?.displayIfNoAnnotations === false
    ) {
      return <></>;
    }

    return (
      <Content key={i} value={plugin.id}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PluginInformationPanelComponent
            annotations={annotations}
            {...plugin?.informationPanel?.componentProps}
            activeManifest={activeManifest}
            canvas={canvas}
            viewerConfigOptions={configOptions}
            openSeadragonViewer={openSeadragonViewer}
            useViewerDispatch={useViewerDispatch}
            useViewerState={useViewerState}
          />
        </ErrorBoundary>
      </Content>
    );
  }

  useEffect(() => {
    if (activeResource) {
      return;
    } else if (renderAbout) {
      setActiveResource("manifest-about");
    } else if (
      annotationResources &&
      annotationResources?.length > 0 &&
      !renderAbout
    ) {
      setActiveResource(annotationResources[0].id);
    }
  }, [activeCanvas, renderAbout, annotationResources]);

  function handleScroll() {
    if (!isAutoScrolling) {
      clearTimeout(isUserScrolling);
      const timeout = setTimeout(() => {
        dispatch({
          type: "updateUserScrolling",
          isUserScrolling: undefined,
        });
      }, UserScrollTimeout);

      dispatch({
        type: "updateUserScrolling",
        isUserScrolling: timeout,
      });
    }
  }

  const handleValueChange = (value: string) => {
    setActiveResource(value);
  };

  return (
    <Wrapper
      data-testid="information-panel"
      defaultValue={activeResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={activeResource}
      className="clover-viewer-information-panel"
    >
      <List aria-label="select chapter" data-testid="information-panel-list">
        {renderAbout && <Trigger value="manifest-about">About</Trigger>}

        {renderAnnotation &&
          annotationResources &&
          annotationResources
            .filter((annotationPage) => {
              return !pluginsAnnotationPageIds.includes(annotationPage.id);
            })
            .map((resource, i) => (
              <Trigger key={i} value={resource.id}>
                <Label label={resource.label as InternationalString} />
              </Trigger>
            ))}

        {pluginsWithInfoPanel &&
          pluginsWithInfoPanel.map((plugin, i) => {
            return renderPluginLabel(plugin, i);
          })}
      </List>
      <Scroll handleScroll={handleScroll}>
        {renderAbout && (
          <Content value="manifest-about">
            <Information />
          </Content>
        )}

        {renderAnnotation &&
          annotationResources &&
          annotationResources
            .filter((annotationPage) => {
              return !pluginsAnnotationPageIds.includes(annotationPage.id);
            })
            .map((annotationPage) => {
              return (
                <Content key={annotationPage.id} value={annotationPage.id}>
                  <AnnotationPage annotationPage={annotationPage} />
                </Content>
              );
            })}

        {pluginsWithInfoPanel &&
          pluginsWithInfoPanel.map((plugin, i) =>
            renderPluginInformationPanel(plugin, i),
          )}
      </Scroll>
    </Wrapper>
  );
};

export default InformationPanel;
