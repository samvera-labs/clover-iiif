import React, { useEffect, useMemo } from "react";
import { getLabel } from "@/hooks/use-iiif";
import { InternationalString } from "@iiif/presentation-3";
import { Group } from "@/components/Navigator/Cue.styled";
import useWebVtt, {
  NodeWebVttCue,
  NodeWebVttCueNested,
} from "@/hooks/use-webvtt";
import Menu from "@/components/Navigator/Menu";

// @ts-ignore
import { parse } from "node-webvtt";

interface Resource {
  resource: any;
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
  }, [id]);

  return (
    <Group
      aria-label={`navigate ${getLabel(label as InternationalString, "en")}`}
    >
      <Menu items={cues} />
    </Group>
  );
};

export default Resource;
