import React, { useEffect } from "react";
import useWebVtt, { NodeWebVttCueNested } from "src/hooks/use-webvtt";

import { Group } from "src/components/Viewer/InformationPanel/Annotation/VTT/Cue.styled";
import { InternationalString } from "@iiif/presentation-3";
import Menu from "src/components/Viewer/InformationPanel/Menu";
import { getLabel } from "src/hooks/use-iiif";

type AnnotationItemVTTProps = {
  inlineCues?: NodeWebVttCueNested[];
  label: InternationalString | undefined;
  vttUri?: string;
};

const AnnotationItemVTT: React.FC<AnnotationItemVTTProps> = ({
  inlineCues,
  label,
  vttUri,
}) => {
  const [cues, setCues] = React.useState<Array<NodeWebVttCueNested>>(inlineCues ? inlineCues : []);
  const { createNestedCues, orderCuesByTime, parseVttData } = useWebVtt();
  const [isNetworkError, setIsNetworkError] = React.useState<Error>();

  useEffect(
    () => {
      if (vttUri)
        fetch(vttUri, {
          headers: {
            "Content-Type": "text/plain",
            Accept: "application/json",
          },
        })
          .then((response) => response.text())
          .then((data) => {
            parseVttData(data).then((flatCues) => {
              const orderedCues = orderCuesByTime(flatCues);
              const nestedCues = createNestedCues(orderedCues);
              setCues(nestedCues);
            });
          })
          .catch((error) => {
            console.error(vttUri, error.toString());
            setIsNetworkError(error);
          });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vttUri],
  ); // NOTE: Do not include createNestedCues and orderCuesByTime in the dependency array as it will cause an infinite loop

  return (
    <Group
      data-testid="annotation-item-vtt"
      aria-label={`${getLabel(label as InternationalString)}`}
    >
      {isNetworkError && (
        <div data-testid="error-message">
          Network Error: {isNetworkError.toString()}
        </div>
      )}
      <Menu items={cues} />
    </Group>
  );
};

export default AnnotationItemVTT;
