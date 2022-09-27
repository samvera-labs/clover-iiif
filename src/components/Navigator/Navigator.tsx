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
import Information from "@/components/Navigator/About/About";
import { useViewerState } from "@/context/viewer-context";

interface NavigatorProps {
  activeCanvas: string;
  resources?: Array<LabeledResource>;
}

export const Navigator: React.FC<NavigatorProps> = ({
  activeCanvas,
  resources,
}) => {
  const viewerState: any = useViewerState();
  const { configOptions } = viewerState;
  const { renderAbout } = configOptions;

  const [activeResource, setActiveResource] = useState<string>();

  useEffect(() => {
    if (renderAbout) {
      setActiveResource("manifest-about");
    } else if (resources && resources?.length > 0 && !renderAbout) {
      setActiveResource(resources[0].id);
    }
  }, [activeCanvas, resources]);

  const handleValueChange = (value: string) => {
    setActiveResource(value);
  };

  if (!resources) return <></>;

  return (
    <Wrapper
      data-testid="navigator"
      defaultValue={activeResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={activeResource}
    >
      <List aria-label="select chapter" data-testid="navigator-list">
        {renderAbout && <Trigger value="manifest-about">About</Trigger>}
        {resources &&
          resources.map(({ id, label }) => (
            <Trigger key={id} value={id as string}>
              <Label label={label} />
            </Trigger>
          ))}
      </List>
      <Scroll>
        {renderAbout && (
          <Content value="manifest-about">
            <Information />
          </Content>
        )}
        {resources &&
          resources.map((resource) => {
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
