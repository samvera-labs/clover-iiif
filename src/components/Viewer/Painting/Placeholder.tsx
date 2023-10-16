import { getLabel, getPaintingResource } from "src/hooks/use-iiif";

import { InternationalString } from "@iiif/presentation-3";
import { PlaceholderStyled } from "./Placeholder.styled";
import React from "react";
import { useViewerState } from "src/context/viewer-context";

interface Props {
  isMedia: boolean;
  label: InternationalString | null;
  placeholderCanvas: string;
  setIsInteractive: (arg0: boolean) => void;
}

const PaintingPlaceholder: React.FC<Props> = ({
  isMedia,
  label,
  placeholderCanvas,
  setIsInteractive,
}) => {
  const { vault } = useViewerState();

  const painting = getPaintingResource(vault, placeholderCanvas);

  const placeholder = painting ? painting[0] : undefined;
  const labelAsArray = label
    ? (getLabel(label) as string[])
    : ["placeholder image"];

  return (
    <PlaceholderStyled onClick={() => setIsInteractive(true)} isMedia={isMedia}>
      <img
        src={placeholder?.id || ""}
        alt={labelAsArray.join()}
        height={placeholder?.height}
        width={placeholder?.width}
      />
    </PlaceholderStyled>
  );
};

export default PaintingPlaceholder;
