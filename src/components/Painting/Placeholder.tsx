import React, { useEffect } from "react";
import { useViewerState } from "@/context/viewer-context";
import { getThumbnail } from "@/hooks/use-iiif";
import { PlaceholderStyled } from "./Placeholder.styled";

interface Props {
  activeCanvas: string;
  setIsInteractive: (arg0: boolean) => void;
}

const PaintingPlaceholder: React.FC<Props> = ({
  activeCanvas,
  setIsInteractive,
}) => {
  const { configOptions, vault } = useViewerState();
  const normalizedCanvas = vault.get(activeCanvas);
  const size = configOptions.canvasHeight;

  const thumbnail = getThumbnail(
    vault,
    {
      accompanyingCanvas: undefined,
      annotationPage: {},
      annotations: [],
      canvas: normalizedCanvas,
    },
    size,
    size,
  );

  return (
    <PlaceholderStyled onClick={() => setIsInteractive(true)}>
      <img
        src={thumbnail?.id || ""}
        alt="Something"
        height={size}
        width={size}
      />
    </PlaceholderStyled>
  );
};

export default PaintingPlaceholder;
