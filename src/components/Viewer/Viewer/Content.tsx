import {
  Aside,
  Content,
  Main,
  MediaWrapper,
} from "src/components/Viewer/Viewer/Viewer.styled";

import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React from "react";
import {
  setContentSearchResource,
  useViewerState,
} from "src/context/viewer-context";

const ViewerContent: React.FC = () => {
  const {
    contentStateAnnotation,
    isInformationOpen,
    configOptions,
    sequence,
    visibleCanvases,
    activeCanvas,
    activeManifest,
    annotationResources,
    searchServiceUrl,
    painting,
    contentSearchResource,
    vault,
    isAudioVideo,
  } = useViewerState();
  const { informationPanel } = configOptions;

  const { items } = vault.get(activeManifest);

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
    informationPanel?.renderAnnotation &&
    !informationPanel.open;

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
          painting={painting!}
        />
        {sequence[1].length > 1 && (
          <MediaWrapper className="clover-viewer-media-wrapper">
            <Media items={items} activeItem={0} />
          </MediaWrapper>
        )}
      </Main>
      {isAside && (
        <Aside data-aside-active={isAside} data-aside-toggle={renderToggle}>
          <InformationPanel
            activeCanvas={activeCanvas}
            annotationResources={annotationResources}
            searchServiceUrl={searchServiceUrl}
            setContentSearchResource={setContentSearchResource}
            contentSearchResource={contentSearchResource}
          />
        </Aside>
      )}
    </Content>
  );
};

export default ViewerContent;
