import React, { useState } from "react";
import Media from "components/Media/Media";
import Navigator from "components/Navigator/Navigator";
import Player from "components/Player/Player";
import ImageViewer from "components/ImageViewer/ImageViewer";
import { Button } from "@nulib/design-system";
import { Canvas, IIIFExternalWebResource } from "@hyperion-framework/types";
import {
  Content,
  Main,
  CollapsibleTrigger,
  CollapsibleContent,
  MediaWrapper,
  Aside,
} from "./Viewer.styled";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";

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
  const [currentTime, setCurrentTime] = useState<number>(0);

  const handleCurrentTime = (t: number) => setCurrentTime(t);

  return (
    <Content>
      <Main>
        {isMedia ? (
          <Player
            painting={painting as IIIFExternalWebResource}
            resources={resources}
            currentTime={handleCurrentTime}
          />
        ) : (
          <ImageViewer {...(painting as IIIFExternalWebResource)} />
        )}
        <CollapsibleTrigger data-navigator={isNavigator}>
          <Button as="span">
            {isNavigatorOpen ? "View Media Items" : "View Navigator"}
          </Button>
        </CollapsibleTrigger>
        <MediaWrapper>
          <Media items={items} activeItem={0} />
        </MediaWrapper>
      </Main>
      {isNavigator && (
        <Aside>
          <CollapsibleContent>
            <Navigator
              activeCanvas={activeCanvas}
              currentTime={currentTime}
              defaultResource={resources[0].id as string}
              resources={resources}
            />
          </CollapsibleContent>
        </Aside>
      )}
    </Content>
  );
};

export default ViewerContent;
