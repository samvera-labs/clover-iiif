import {
  Aside,
  CollapsibleContent,
  CollapsibleTrigger,
  Content,
  Main,
  MediaWrapper,
} from "src/components/Viewer/Viewer/Viewer.styled";
import {
  Canvas,
  IIIFExternalWebResource,
  AnnotationPageNormalized,
} from "@iiif/presentation-3";

import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React from "react";
import { useViewerState } from "src/context/viewer-context";

export interface ViewerContentProps {
  activeCanvas: string;
  annotationResources: AnnotationResources;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  contentSearchResource?: AnnotationResource;
  painting: IIIFExternalWebResource[];
  items: Canvas[];
  isAudioVideo: boolean;
}

const ViewerContent: React.FC<ViewerContentProps> = ({
  activeCanvas,
  annotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
  isAudioVideo,
  items,
  painting,
}) => {
  const { isInformationOpen, configOptions } = useViewerState();
  const { informationPanel } = configOptions;

  /**
   * The information panel should be rendered if toggled true and if
   * there is content (About or Supplementing Resources) to display.
   */

  const isAside = informationPanel?.renderAbout && isInformationOpen;

  const isForcedAside =
    informationPanel?.renderAnnotation &&
    annotationResources.length > 0 &&
    !informationPanel.open;

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
            <span>{isInformationOpen ? "View Items" : "More Information"}</span>
          </CollapsibleTrigger>
        )}

        {items.length > 1 && (
          <MediaWrapper className="clover-viewer-media-wrapper">
            <Media items={items} activeItem={0} />
          </MediaWrapper>
        )}
      </Main>
      {(isAside || isForcedAside) && (
        <Aside>
          <CollapsibleContent>
            <InformationPanel
              activeCanvas={activeCanvas}
              annotationResources={annotationResources}
              searchServiceUrl={searchServiceUrl}
              setContentSearchResource={setContentSearchResource}
              contentSearchResource={contentSearchResource}
            />
          </CollapsibleContent>
        </Aside>
      )}
    </Content>
  );
};

export default ViewerContent;
