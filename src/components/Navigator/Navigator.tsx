import React, { useEffect, useState } from "react";
import { InternationalString } from "@hyperion-framework/types";
import { Content, List, Scroll, Trigger, Wrapper } from "./Navigator.styled";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import { getLabel } from "hooks/use-hyperion-framework";
import Resource from "./Resource";

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
  const [activeResource, setActiveResource] = useState<string>(defaultResource);

  useEffect(() => {
    setActiveResource(defaultResource);
  }, [activeCanvas]);

  const handleValueChange = (value: string) => {
    setActiveResource(value);
  };

  if (!resources) return <></>;

  return (
    <Wrapper
      data-testid="navigator"
      defaultValue={defaultResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={activeResource}
    >
      <List aria-label="select chapter" data-testid="navigator-list">
        {resources.map((resource) => (
          <Trigger key={resource.id} value={resource.id as string}>
            {getLabel(resource.label as InternationalString, "en")}
          </Trigger>
        ))}
      </List>
      <Scroll>
        {resources.map((resource) => (
          <Content key={resource.id} value={resource.id as string}>
            <Resource currentTime={currentTime} resource={resource} />
          </Content>
        ))}
      </Scroll>
    </Wrapper>
  );
};

export default Navigator;
