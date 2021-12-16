import React, { useEffect } from "react";
import Cue from "components/Navigator/Cue";
import { getLabel } from "hooks/use-hyperion-framework";
import { InternationalString } from "@hyperion-framework/types";
import { Group } from "./Cue.styled";

// @ts-ignore
import { parse } from "node-webvtt";

interface Resource {
  currentTime: number;
  resource: any;
}

interface Cue {
  id: number;
  start: number;
  end: number;
  text: string;
}

const Resource: React.FC<Resource> = ({ currentTime, resource }) => {
  const [cues, setCues] = React.useState<Array<Cue>>([]);
  const { id, label } = resource;

  useEffect(() => {
    fetch(id, {
      headers: {
        "Content-Type": "text/plain",
        Accept: "application/json",
      },
    })
      .then((response) => response.text())
      .then((data) => {
        setCues(parse(data).cues as unknown as Array<Cue>);
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
