import {
  CollapsibleContent,
  CollapsibleTrigger,
  Content,
  Main,
  MediaWrapper,
} from "src/components/Viewer/Viewer/Viewer.styled";
import { Canvas, IIIFExternalWebResource } from "@iiif/presentation-3";

import { AnnotationResources } from "src/types/annotations";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React from "react";
import { useViewerState } from "src/context/viewer-context";

export interface ViewerContentProps {
  activeCanvas: string;
  annotationResources: AnnotationResources;
  isAudioVideo: boolean;
  items: Canvas[];
  painting: IIIFExternalWebResource[];
}

const ViewerContent: React.FC<ViewerContentProps> = ({
  activeCanvas,
  annotationResources,
  isAudioVideo,
  items,
  painting,
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
          annotationResources={annotationResources}
          isMedia={isAudioVideo}
          painting={painting}
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
      {(informationOpen || isAside) && (
        <CollapsibleContent>
          <InformationPanel
            activeCanvas={activeCanvas}
            annotationResources={annotationResources}
          />
        </CollapsibleContent>
      )}
    </Content>
  );
};

export default ViewerContent;
