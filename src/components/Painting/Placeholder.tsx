import React from "react";
import { useViewerState } from "@/context/viewer-context";
import { getLabel, getPaintingResource } from "@/hooks/use-iiif";
import { PlaceholderStyled } from "./Placeholder.styled";
import { InternationalString } from "@iiif/presentation-3";

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
  const placeholder = getPaintingResource(vault, placeholderCanvas);
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
