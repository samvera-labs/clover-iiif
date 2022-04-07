import React from "react";
import Media from "components/Media/Media";
import Navigator from "components/Navigator/Navigator";
import Player from "components/Player/Player";
import ImageViewer from "components/ImageViewer/ImageViewer";
import { Button } from "@nulib/design-system";
import { Canvas, IIIFExternalWebResource } from "@iiif/presentation-3";
import {
  Content,
  Main,
  CollapsibleTrigger,
  CollapsibleContent,
  MediaWrapper,
  Aside,
} from "./Viewer.styled";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import { CurrentTimeProvider } from "context/current-time-context";

interface Props {
  activeCanvas: string;
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
  items: Canvas[];
  isMedia: boolean;
  isNavigator: boolean;
  isNavigatorOpen: boolean;
}

const ViewerContent: React.FC<Props> = ({
  activeCanvas,
  painting,
  resources,
  items,
  isMedia,
  isNavigator,
  isNavigatorOpen,
}) => {
  return (
    <Content>
      <CurrentTimeProvider>
        <Main>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
            />
          ) : (
            <ImageViewer {...(painting as IIIFExternalWebResource)} />
          )}
          <CollapsibleTrigger data-navigator={isNavigator}>
            <Button as="span">
              {isNavigatorOpen ? "View Media Items" : "View Navigator"}
            </Button>
          </CollapsibleTrigger>
          {items.length > 1 && (
            <MediaWrapper>
              <Media items={items} activeItem={0} />
            </MediaWrapper>
          )}
        </Main>
        {isNavigator && (
          <Aside>
            <CollapsibleContent>
              <Navigator
                activeCanvas={activeCanvas}
                defaultResource={resources[0].id as string}
                resources={resources}
              />
            </CollapsibleContent>
          </Aside>
        )}
      </CurrentTimeProvider>
    </Content>
  );
};

export default ViewerContent;
