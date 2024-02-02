import {
  Content,
  List,
  Scroll,
  Trigger,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import AnnotationPage from "src/components/Viewer/InformationPanel/Annotation/Page";
import { AnnotationResources } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";

interface NavigatorProps {
  activeCanvas: string;
  annotationResources?: AnnotationResources;
}

export const InformationPanel: React.FC<NavigatorProps> = ({
  activeCanvas,
  annotationResources,
}) => {
  const viewerState: ViewerContextStore = useViewerState();
  const {
    configOptions: { informationPanel },
  } = viewerState;

  const [activeResource, setActiveResource] = useState<string>();

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;

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
      </List>
      <Scroll>
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
      </Scroll>
    </Wrapper>
  );
};

export default InformationPanel;
