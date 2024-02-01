import {
  AnnotationPage,
  Canvas,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import {
  Aside,
  CollapsibleContent,
  CollapsibleTrigger,
  Content,
  Main,
  MediaWrapper,
} from "src/components/Viewer/Viewer/Viewer.styled";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React from "react";
import { useViewerState } from "src/context/viewer-context";

interface Props {
  activeCanvas: string;
  painting: IIIFExternalWebResource[];
  annotationResources: AnnotationPage[];
  items: Canvas[];
  isAudioVideo: boolean;
}

const ViewerContent: React.FC<Props> = ({
  activeCanvas,
  painting,
  annotationResources,
  items,
  isAudioVideo,
}) => {
  const { informationOpen, configOptions } = useViewerState();
  const { informationPanel } = configOptions;

  /**
   * The information panel should be rendered if toggled true and if
   * there is content (About or Supplementing Resources) to display.
   */

  const isAside =
    informationPanel?.renderAbout ||
    (informationPanel?.renderAnnotation && annotationResources.length > 0);

  return (
    <Content
      className="clover-viewer-content"
      data-testid="clover-viewer-content"
    >
      <Main>
        <Painting
          activeCanvas={activeCanvas}
          isMedia={isAudioVideo}
          painting={painting}
          // resources={resources}
          annotationResources={annotationResources}
        />

        {isAside && (
          <CollapsibleTrigger>
            <span>{informationOpen ? "View Items" : "More Information"}</span>
          </CollapsibleTrigger>
        )}

        {items.length > 1 && (
          <MediaWrapper className="clover-viewer-media-wrapper">
            <Media items={items} activeItem={0} />
          </MediaWrapper>
        )}
      </Main>
      {informationOpen && isAside && (
        <Aside>
          <CollapsibleContent>
            <InformationPanel
              activeCanvas={activeCanvas}
              // resources={resources}
              annotationResources={annotationResources}
            />
          </CollapsibleContent>
        </Aside>
      )}
    </Content>
  );
};

export default ViewerContent;
