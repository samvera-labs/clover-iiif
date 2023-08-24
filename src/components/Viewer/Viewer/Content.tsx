import {
  Aside,
  CollapsibleContent,
  CollapsibleTrigger,
  Content,
  Main,
  MediaWrapper,
} from "src/components/Viewer/Viewer/Viewer.styled";
import { Canvas, IIIFExternalWebResource } from "@iiif/presentation-3";

import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import Media from "src/components/Viewer/Media/Media";
import Navigator from "src/components/Viewer/Navigator/Navigator";
import Painting from "../Painting/Painting";
import React from "react";

interface Props {
  activeCanvas: string;
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
  items: Canvas[];
  isAbout: boolean;
  isInformation: boolean;
  isMedia: boolean;
  isNavigator: boolean;
  isNavigatorOpen: boolean;
}

const ViewerContent: React.FC<Props> = ({
  activeCanvas,
  painting,
  resources,
  items,
  isAbout,
  isInformation,
  isNavigator,
  isNavigatorOpen,
  isMedia,
}) => {
  return (
    <Content className="clover-content">
      <Main>
        <Painting
          activeCanvas={activeCanvas}
          isMedia={isMedia}
          painting={painting}
          resources={resources}
        />

        {isNavigator && (
          <CollapsibleTrigger>
            <span>{isNavigatorOpen ? "View Items" : "More Information"}</span>
          </CollapsibleTrigger>
        )}
        {items.length > 1 && (
          <MediaWrapper className="clover-canvases">
            <Media items={items} activeItem={0} />
          </MediaWrapper>
        )}
      </Main>
      {isInformation && (isAbout || isNavigator) && (
        <Aside>
          <CollapsibleContent>
            <Navigator activeCanvas={activeCanvas} resources={resources} />
          </CollapsibleContent>
        </Aside>
      )}
    </Content>
  );
};

export default ViewerContent;
