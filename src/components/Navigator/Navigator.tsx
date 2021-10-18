import React, { useEffect } from "react";
import { styled } from "@stitches/react";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import NavigatorResource from "./NavigatorResource";
import NavigatorTab from "./NavigatorTab";
import { theme } from "theme";

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
              key={resource.id}
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
  boxShadow: "-5px -5px 5px #00000011",
});

const NavigatorHeader = styled("header", {
  display: "flex",
  flexGrow: "0",
  margin: "0 1.618rem 0",
  borderBottom: `4px solid ${theme.color.secondaryAlt}`,
  backgroundColor: theme.color.secondary,
});

const NavigatorBody = styled("div", {
  display: "flex",
  flexGrow: "1",
  flexShrink: "0",
  position: "relative",

  "&:after": {
    position: "absolute",
    bottom: 0,
    content: "",
    width: "100%",
    height: "1rem",
    backgroundImage: `linear-gradient(0deg, #FFFFFF 0%, #FFFFFF00 100%)`,
    zIndex: 1,
  },
});

const NavigatorScroll = styled("div", {
  position: "absolute",
  overflowY: "scroll",
  height: "calc(100% - 2rem)",
  width: "100%",
  padding: "1rem 0 1rem",
});

export default Navigator;
