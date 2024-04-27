import { Box, Flex, ScrollArea, Tabs } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import AnnotationPage from "src/components/Viewer/InformationPanel/Annotation/Page";
import { AnnotationResources } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { Scroll } from "./InformationPanel.styled";

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
    configOptions: { informationPanel },
    isUserScrolling,
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

  function handleScroll() {
    // console.log("Type of scroll: ", isAutoScrolling ? 'auto' : 'user');
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
    <Box style={{ width: "100%", height: "100%" }}>
      <Tabs.Root
        data-testid="information-panel"
        defaultValue={activeResource}
        onValueChange={handleValueChange}
        orientation="horizontal"
        value={activeResource}
        className="clover-viewer-information-panel"
      >
        <Tabs.List
          aria-label="select chapter"
          data-testid="information-panel-list"
        >
          {renderAbout && (
            <Tabs.Trigger value="manifest-about">About</Tabs.Trigger>
          )}

          {renderAnnotation &&
            annotationResources &&
            annotationResources.map((resource, i) => (
              <Tabs.Trigger key={i} value={resource.id}>
                <Label label={resource.label as InternationalString} />
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <ScrollArea style={{ height: "500px" }}>
          <Scroll>
            {renderAbout && (
              <Tabs.Content value="manifest-about">
                <Information />
              </Tabs.Content>
            )}

            {renderAnnotation &&
              annotationResources &&
              annotationResources.map((annotationPage) => {
                return (
                  <Tabs.Content
                    key={annotationPage.id}
                    value={annotationPage.id}
                  >
                    <AnnotationPage annotationPage={annotationPage} />
                  </Tabs.Content>
                );
              })}
          </Scroll>
        </ScrollArea>
      </Tabs.Root>
    </Box>
  );
};

export default InformationPanel;
