import {
  AnnotationPageNormalized,
  Canvas,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import { AnnotationResource, AnnotationResources } from "src/types/annotations";
import {
  Content,
  Main,
  MediaWrapper,
} from "src/components/Viewer/Viewer/Viewer.styled";

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
  contentSearchResource,
  isAudioVideo,
  items,
  painting,
}) => {
  const {
    contentStateAnnotation,
    isInformationOpen,
    configOptions,
    sequence,
    visibleCanvases,
  } = useViewerState();
  const { informationPanel } = configOptions;
  /**
   * The information panel should be rendered if toggled true and if
   * there is content (About or Annotations Resources) to display.
   */
  const visibleCanvasesIds = visibleCanvases.map((canvas) => canvas.id);

  const hasAnnotations =
    annotationResources.length > 0 ||
    // @ts-ignore
    visibleCanvasesIds.includes(contentStateAnnotation?.target?.source?.id);

  const isForcedAside =
    hasAnnotations &&
    informationPanel?.renderAnnotation

  const isAside =
    (informationPanel?.renderAbout && isInformationOpen) || isForcedAside;

  const renderToggle = informationPanel?.renderToggle;

  return (
    <Content
      className="clover-viewer-content"
      data-testid="clover-viewer-content"
    >
      <Main data-aside-active={isAside} data-aside-toggle={renderToggle}>
        <Painting
          activeCanvas={activeCanvas}
          annotationResources={annotationResources}
          contentSearchResource={contentSearchResource}
          isMedia={isAudioVideo}
          painting={painting}
        />

        {sequence[1].length > 1 && (
          <MediaWrapper className="clover-viewer-media-wrapper">
            <Media items={items} activeItem={0} />
          </MediaWrapper>
        )}
      </Main>
    </Content>
  );
};

export default ViewerContent;
