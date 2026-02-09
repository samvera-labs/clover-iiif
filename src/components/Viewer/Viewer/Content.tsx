import React from "react";
import {
  AnnotationPageNormalized,
  Canvas,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";

import { useViewerState } from "src/context/viewer-context";
import { hasAnyPanel } from "src/lib/information-panel-helpers";
import { setupPlugins } from "src/lib/plugin-helpers";

import {
  Aside,
  Content,
  Main,
  MediaWrapper,
} from "../Viewer/Viewer.styled";
import InformationPanel from "../InformationPanel/InformationPanel";
import Painting from "../Painting/Painting";
import Media from "../Media/Media";

import { AnnotationResource, AnnotationResources } from "src/types/annotations";

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
  const {
    isInformationOpen,
    configOptions,
    sequence,
    plugins,
  } = useViewerState();
  const { informationPanel } = configOptions;

  const { pluginsWithInfoPanel } = setupPlugins(plugins);

  const hasPanel = hasAnyPanel({
		informationPanel: informationPanel,
    annotationResources,
    contentSearchResource,
    pluginsWithInfoPanel,
  });

  const renderToggle = informationPanel?.renderToggle;
  const isAside = hasPanel && isInformationOpen;

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
      {isAside && (
        <Aside data-aside-active={isAside} data-aside-toggle={renderToggle}>
          <InformationPanel
            activeCanvas={activeCanvas}
            annotationResources={annotationResources}
            searchServiceUrl={searchServiceUrl}
            setContentSearchResource={setContentSearchResource}
            contentSearchResource={contentSearchResource}
						pluginsWithInfoPanel={pluginsWithInfoPanel}
          />
        </Aside>
      )}
    </Content>
  );
};

export default ViewerContent;
