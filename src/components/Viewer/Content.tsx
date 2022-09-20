import React from "react";
import Media from "@/components/Media/Media";
import Navigator from "@/components/Navigator/Navigator";
import Player from "@/components/Player/Player";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
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
import { CurrentTimeProvider } from "@/context/current-time-context";

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
  isMedia,
}) => {
  console.log(isAbout);
  return (
    <Content className="clover-content">
      <CurrentTimeProvider>
        <Main>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
            />
          ) : (
            painting && <ImageViewer body={painting} key={activeCanvas} />
          )}
          <CollapsibleTrigger>
            <Button as="span">
              {isInformation ? "View Items" : "More Information"}
            </Button>
          </CollapsibleTrigger>
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
      </CurrentTimeProvider>
    </Content>
  );
};

export default ViewerContent;
