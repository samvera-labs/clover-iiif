import React from "react";
import { InternationalString } from "@hyperion-framework/types";
import { LabeledResource } from "hooks/use-hyperion-framework/getSupplementingResources";
import { getLabel } from "hooks/use-hyperion-framework";

export interface TrackProps {
  resource: LabeledResource;
  ignoreCaptionLabels: string[];
}

const Track: React.FC<TrackProps> = ({ resource, ignoreCaptionLabels }) => {
  const label = getLabel(resource.label as InternationalString, "en") as any;

  const isIgnored = label.some((value: string) =>
    ignoreCaptionLabels.includes(value),
  );

  if (isIgnored) return null;

  return (
    <track
      key={resource.id}
      src={resource.id as string}
      label={label}
      srcLang="en"
      data-testid="player-track"
    />
  );
};

export default Track;
