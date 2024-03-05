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
} from "src/context/viewer-context";

import AnnotationPage from "src/components/Viewer/InformationPanel/Annotation/Page";
import { AnnotationResources } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import { InternationalString, CanvasNormalized } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";

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
  } = viewerState;
  const { informationPanel } = configOptions;

  const [activeResource, setActiveResource] = useState<string>();

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;

  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  const pluginsWithoutAnnotations = plugins.filter((plugin) => {
    let match = false;
    if (plugin.informationPanel?.annotationPageId === undefined) {
      match = true;
    }

    return match;
  });

  function renderPluginInformationPanel(plugin) {
    const PluginInformationPanel = plugin?.informationPanel
      ?.component as unknown as React.ElementType;

    return (
      <PluginInformationPanel
        canvas={canvas}
        openSeadragonViewer={openSeadragonViewer}
        configOptions={configOptions}
      />
    );
  }

  useEffect(() => {
    if (renderAbout) {
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
          annotationResources.map((resource, i) => (
            <Trigger key={i} value={resource.id}>
              <Label label={resource.label as InternationalString} />
            </Trigger>
          ))}

        {pluginsWithoutAnnotations &&
          pluginsWithoutAnnotations.map((plugin, i) => (
            <Trigger key={i} value={plugin.id}>
              <Label
                label={
                  plugin.informationPanel?.label ||
                  ({ none: [plugin.id] } as InternationalString)
                }
              />
            </Trigger>
          ))}
      </List>
      <Scroll handleScroll={handleScroll}>
        {renderAbout && (
          <Content value="manifest-about">
            <Information />
          </Content>
        )}

        {renderAnnotation &&
          annotationResources &&
          annotationResources.map((annotationPage) => {
            return (
              <Content key={annotationPage.id} value={annotationPage.id}>
                <AnnotationPage annotationPage={annotationPage} />
              </Content>
            );
          })}

        {pluginsWithoutAnnotations &&
          pluginsWithoutAnnotations.map((plugin, i) => (
            <Content key={i} value={plugin.id}>
              {renderPluginInformationPanel(plugin)}
            </Content>
          ))}
      </Scroll>
    </Wrapper>
  );
};

export default InformationPanel;
