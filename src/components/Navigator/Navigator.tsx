import React, { useEffect, useState } from "react";
import { InternationalString } from "@iiif/presentation-3";
import {
  Content,
  List,
  Scroll,
  Trigger,
  Wrapper,
} from "@/components/Navigator/Navigator.styled";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import Resource from "@/components/Navigator/Resource";
import { Label } from "@samvera/nectar-iiif";

interface NavigatorProps {
  activeCanvas: string;
  defaultResource: string;
  resources?: Array<LabeledResource>;
}

export const Navigator: React.FC<NavigatorProps> = ({
  activeCanvas,
  defaultResource,
  resources,
}) => {
  const [activeResource, setActiveResource] = useState<string>(defaultResource);

  useEffect(() => {
    setActiveResource(defaultResource);
  }, [activeCanvas, resources]);

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
        {resources.map(({ id, label }) => (
          <Trigger key={id} value={id as string}>
            <Label label={label} />
          </Trigger>
        ))}
      </List>
      <Scroll>
        {resources.map((resource) => {
          return (
            <Content key={resource.id} value={resource.id as string}>
              <Resource resource={resource} />
            </Content>
          );
        })}
      </Scroll>
    </Wrapper>
  );
};

export default Navigator;
