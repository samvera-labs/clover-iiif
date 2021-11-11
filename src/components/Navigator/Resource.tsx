import React, { useEffect } from "react";
import { fromVtt } from "subtitles-parser-vtt";
import Cue from "components/Navigator/Cue";
import { convertTimeToSeconds } from "services/utils";
import { getLabel } from "hooks/use-hyperion-framework";
import { InternationalString } from "@hyperion-framework/types";
import { Group } from "./Cue.styled";

interface Resource {
  currentTime: number;
  resource: any;
}

interface Cue {
  id: number;
  startTime: string;
  endTime: string;
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
        setCues(fromVtt(data) as unknown as Array<Cue>);
      })
      .catch((error) => console.error(id, error.toString()));
  }, [id]);

  return (
    <Group
      aria-label={`navigate ${getLabel(label as InternationalString, "en")}`}
    >
      {cues.map(({ id, text, startTime, endTime }) => {
        const startTimeSeconds = convertTimeToSeconds(startTime);
        const endTimeSeconds = convertTimeToSeconds(endTime);

        let active =
          startTimeSeconds <= currentTime && currentTime < endTimeSeconds;

        return (
          <Cue
            isActive={active}
            label={text}
            startTime={startTime}
            time={startTimeSeconds}
            key={id}
          />
        );
      })}
    </Group>
  );
};

export default Resource;
