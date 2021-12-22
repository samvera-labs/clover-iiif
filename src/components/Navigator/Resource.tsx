import React, { useEffect } from "react";
import Cue from "components/Navigator/Cue";
import { getLabel } from "hooks/use-hyperion-framework";
import { InternationalString } from "@hyperion-framework/types";
import { Group } from "./Cue.styled";
import useWebVtt, {
  NodeWebVttCue,
  NodeWebVttCueNested,
} from "hooks/use-webvtt";

// @ts-ignore
import { parse } from "node-webvtt";

interface Resource {
  currentTime: number;
  resource: any;
}

const Resource: React.FC<Resource> = ({ currentTime, resource }) => {
  const [cues, setCues] = React.useState<Array<NodeWebVttCueNested>>([]);
  const { id, label } = resource;
  const { createNestedCues, orderCuesByTime } = useWebVtt();

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
        setCues(nestedCues);
      })
      .catch((error) => console.error(id, error.toString()));
  }, [id]);

  return (
    <Group
      aria-label={`navigate ${getLabel(label as InternationalString, "en")}`}
    >
      {cues.map(({ text, start, end, children: cueChildren, identifier }) => {
        const isActive = (start: number, end: number): boolean =>
          start <= currentTime && currentTime < end;

        return (
          <React.Fragment key={identifier}>
            <Cue isActive={isActive(start, end)} label={text} time={start} />
            {cueChildren &&
              cueChildren.length > 0 &&
              cueChildren.map(
                ({
                  start: childStart,
                  end: childEnd,
                  text: childText,
                  identifier: childIdentifier,
                }) => {
                  return (
                    <Cue
                      isActive={isActive(childStart, childEnd)}
                      isChild
                      label={childText}
                      time={childStart}
                      key={childIdentifier}
                    />
                  );
                },
              )}
          </React.Fragment>
        );
      })}
    </Group>
  );
};

export default Resource;
