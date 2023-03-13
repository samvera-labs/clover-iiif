import React, { useEffect } from "react";
import { useViewerState } from "@/context/viewer-context";
import { getPaintingResource, getThumbnail } from "@/hooks/use-iiif";
import { PlaceholderStyled } from "./Placeholder.styled";

interface Props {
  activeCanvas: string;
  setIsInteractive: (arg0: boolean) => void;
}

const PaintingPlaceholder: React.FC<Props> = ({
  activeCanvas,
  setIsInteractive,
}) => {
  const { vault } = useViewerState();
  const normalizedCanvas = vault.get(activeCanvas);

  const placeholder = getPaintingResource(
    vault,
    normalizedCanvas?.placeholderCanvas?.id,
  );

  return (
    <PlaceholderStyled onClick={() => setIsInteractive(true)}>
      <img
        src={placeholder?.id || ""}
        alt="Something"
        height={placeholder?.height}
        width={placeholder?.width}
      />
    </PlaceholderStyled>
  );
};

export default PaintingPlaceholder;
