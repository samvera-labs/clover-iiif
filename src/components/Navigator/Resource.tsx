import React, { useEffect } from "react";
import Cue from "components/Navigator/Cue";
import { getLabel } from "hooks/use-hyperion-framework";
import { InternationalString } from "@hyperion-framework/types";
import { Group } from "./Cue.styled";
import useWebVtt, { NodeWebVttCue } from "hooks/use-webvtt";

// @ts-ignore
import { parse } from "node-webvtt";

interface Resource {
  currentTime: number;
  resource: any;
}

const Resource: React.FC<Resource> = ({ currentTime, resource }) => {
  const [cues, setCues] = React.useState<Array<NodeWebVttCue>>([]);
  const { id, label } = resource;
  const { createNestedCues, isChild, orderCuesByTime } = useWebVtt();

  useEffect(() => {
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
        console.log(`nestedCues`, nestedCues);
        setCues(orderedCues);
      })
      .catch((error) => console.error(id, error.toString()));
  }, [id]);

  return (
    <Group
      aria-label={`navigate ${getLabel(label as InternationalString, "en")}`}
    >
      {cues.map(({ text, start, end }) => {
        let active = start <= currentTime && currentTime < end;

        return (
          <Cue
            isActive={active}
            isChild={isChild({ start, end, text }, cues)}
            label={text}
            time={start}
            key={`${start}:${end}`}
          />
        );
      })}
    </Group>
  );
};

export default Resource;
