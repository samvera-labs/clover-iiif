import React, { useEffect } from "react";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import NavigatorResource from "./NavigatorResource";
import NavigatorTab from "./NavigatorTab";
import {
  NavigatorBody,
  NavigatorHeader,
  NavigatorScroll,
  NavigatorWrapper,
} from "./Navigator.styled";

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

export default Navigator;
