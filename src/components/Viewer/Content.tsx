import React from "react";
import Media from "@/components/Media/Media";
import Navigator from "@/components/Navigator/Navigator";
import { Button } from "@nulib/design-system";
import { Canvas, IIIFExternalWebResource } from "@iiif/presentation-3";
import {
  Content,
  Main,
  CollapsibleTrigger,
  CollapsibleContent,
  MediaWrapper,
  Aside,
} from "@/components/Viewer/Viewer.styled";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import Painting from "../Painting/Painting";

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
            <Button as="span">
              {isNavigatorOpen ? "View Items" : "More Information"}
            </Button>
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
