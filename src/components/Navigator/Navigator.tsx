import React, { useEffect } from "react";
import { styled } from "@stitches/react";
import { LabeledResource } from "hooks/use-hyperion-framework/getContentResourcesByCriteria";
import NavigatorResource from "./NavigatorResource";
import NavigatorTab from "./NavigatorTab";

interface NavigatorProps {
  activeCanvas: string;
  currentTime: number;
  defaultResource: string;
  resources?: Array<LabeledResource>;
}

export const Navigator: React.FC<NavigatorProps> = ({
  activeCanvas,
  currentTime,
  defaultResource,
  resources,
}) => {
  const [activeResource, setActiveResource] =
    React.useState<string>(defaultResource);

  useEffect(() => {
    setActiveResource(defaultResource);
  }, [activeCanvas]);

  const handleChange = (id: string) => setActiveResource(id);

  return (
    <NavigatorWrapper data-testid="navigator-wrapper">
      <NavigatorHeader>
        {resources &&
          resources.map((resource) => (
            <NavigatorTab
              resource={resource}
              active={activeResource === resource.id ? true : false}
              handleChange={handleChange}
            />
          ))}
      </NavigatorHeader>
      <NavigatorBody>
        <NavigatorScroll>
          {resources && (
            <NavigatorResource currentTime={currentTime} id={activeResource} />
          )}
        </NavigatorScroll>
      </NavigatorBody>
    </NavigatorWrapper>
  );
};

const NavigatorWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
  zIndex: "1",
});

const NavigatorHeader = styled("header", {
  display: "flex",
  flexGrow: "0",
  padding: "0 1.618rem 1.618rem",
  backgroundColor: "transparent !important",
});

const NavigatorBody = styled("div", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",
});

const NavigatorScroll = styled("div", {
  position: "absolute",
  overflowY: "scroll",
  height: "100%",
  width: "100%",
});

export default Navigator;
