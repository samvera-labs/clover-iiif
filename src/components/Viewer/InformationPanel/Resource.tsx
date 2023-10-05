import React, { useEffect } from "react";
import useWebVtt, {
  NodeWebVttCue,
  NodeWebVttCueNested,
} from "src/hooks/use-webvtt";

import { Group } from "src/components/Viewer/InformationPanel/Cue.styled";
import { InternationalString } from "@iiif/presentation-3";
import { LabeledResource } from "src/hooks/use-iiif/getSupplementingResources";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import { getLabel } from "src/hooks/use-iiif";
import { parse } from "node-webvtt";

interface Resource {
  resource: LabeledResource;
}

const Resource: React.FC<Resource> = ({ resource }) => {
  const [cues, setCues] = React.useState<Array<NodeWebVttCueNested>>([]);
  const { id, label } = resource;
  const { createNestedCues, orderCuesByTime } = useWebVtt();

  useEffect(() => {
    if (id)
      fetch(id, {
        headers: {
          "Content-Type": "text/plain",
          Accept: "application/json",
        },
      })
        .then((response) => response.text())
        .then((data) => {
          const flatCues = parse(data).cues as unknown as Array<NodeWebVttCue>;
          const orderedCues = orderCuesByTime(flatCues);
          const nestedCues = createNestedCues(orderedCues);
          setCues(nestedCues);
        })
        .catch((error) => console.error(id, error.toString()));
  }, [createNestedCues, id, orderCuesByTime]);

  return (
    <Group
      aria-label={`navigate ${getLabel(label as InternationalString, "en")}`}
    >
      <Menu items={cues} />
    </Group>
  );
};

export default Resource;
