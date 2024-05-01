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
import ContentSearch from "src/components/Viewer/InformationPanel/ContentSearch/ContentSearch";
import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import {
  InternationalString,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";

const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

interface NavigatorProps {
  activeCanvas: string;
  annotationResources?: AnnotationResources;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  contentSearchResource?: AnnotationResource;
}

export const InformationPanel: React.FC<NavigatorProps> = ({
  activeCanvas,
  annotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
}) => {
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    isAutoScrolling,
    configOptions: { informationPanel },
    isUserScrolling,
  } = viewerState;

  const [activeResource, setActiveResource] = useState<string>();

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;
  const renderContentSearch = informationPanel?.renderContentSearch;

  useEffect(() => {
    if (activeResource) {
      return;
    } else if (informationPanel?.defaultTab) {
      const validActiveResource = ["manifest-about", "manifest-content-search"];
      if (annotationResources && annotationResources?.length > 0) {
        validActiveResource.push(annotationResources[0].id);
      }
      if (validActiveResource.includes(informationPanel?.defaultTab)) {
        setActiveResource(informationPanel.defaultTab);
      } else {
        setActiveResource("manifest-about");
      }
    } else if (renderAbout) {
      debugger;
      setActiveResource("manifest-about");
    } else if (renderContentSearch) {
      setActiveResource("manifest-content-search");
    } else if (annotationResources && annotationResources?.length > 0) {
      setActiveResource(annotationResources[0].id);
    }
  }, [
    informationPanel?.defaultTab,
    activeCanvas,
    activeResource,
    renderAbout,
    renderContentSearch,
    annotationResources,
    contentSearchResource,
  ]);

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
        {renderContentSearch && contentSearchResource && (
          <Trigger value="manifest-content-search">
            <Label label={contentSearchResource.label as InternationalString} />
          </Trigger>
        )}
        {renderAnnotation &&
          annotationResources &&
          annotationResources.map((resource, i) => (
            <Trigger key={i} value={resource.id}>
              <Label label={resource.label as InternationalString} />
            </Trigger>
          ))}
      </List>
      <Scroll handleScroll={handleScroll}>
        {renderAbout && (
          <Content value="manifest-about">
            <Information />
          </Content>
        )}
        {renderContentSearch && contentSearchResource && (
          <Content value="manifest-content-search">
            <ContentSearch
              searchServiceUrl={searchServiceUrl}
              setContentSearchResource={setContentSearchResource}
              activeCanvas={activeCanvas}
              annotationPage={contentSearchResource}
            />
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
