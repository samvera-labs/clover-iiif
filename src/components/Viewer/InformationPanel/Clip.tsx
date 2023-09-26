import React, { useEffect } from "react";
import useWebVtt, {
  NodeWebVttCueNested,
} from "src/hooks/use-webvtt";

import { Group } from "src/components/Viewer/InformationPanel/Cue.styled";
import { InternationalString } from "@iiif/presentation-3";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import { getLabel } from "src/hooks/use-iiif";

interface Clip {
  clip: any;
}

const ResourceClip: React.FC<Clip> = ({ clip }) => {
  const [cues, setCues] = React.useState<Array<NodeWebVttCueNested>>([]);
  const { id, label } = clip;
  const { createNestedCues, orderCuesByTime } = useWebVtt();

  function convertHHMMSStoSeconds(hms: string) {
    var parts = hms.split(":");
    return +parts[0] * 60 * 60 + +parts[1] * 60 + +parts[2];
  }

  useEffect(() => {
    if (id)
      fetch(id, {
        headers: {
          "Content-Type": "text/plain",
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          let flatCues = data.map((datum: any) => {
            datum.start = convertHHMMSStoSeconds(datum.start);
            datum.end = convertHHMMSStoSeconds(datum.end);
            return datum;
          });
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

export default ResourceClip;
