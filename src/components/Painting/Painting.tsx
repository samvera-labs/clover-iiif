import React from "react";
import Player from "@/components/Player/Player";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import PaintingPlaceholder from "./Placeholder";
import { PaintingStyled, Toggle } from "./Painting.styled";
import { useViewerState } from "@/context/viewer-context";

interface PaintingProps {
  painting: IIIFExternalWebResource;
  resources: LabeledResource[];
  activeCanvas: string;
  isMedia: boolean;
}

const Painting: React.FC<PaintingProps> = ({
  activeCanvas,
  isMedia,
  painting,
  resources,
}) => {
  const [isInteractive, setIsInteractive] = React.useState(false);
  const { configOptions, vault } = useViewerState();

  return (
    <PaintingStyled css={{ maxHeight: configOptions.canvasHeight }}>
      <Toggle onClick={() => setIsInteractive(!isInteractive)}>
        {isInteractive ? "Close" : "Open"}
      </Toggle>
      {!isInteractive && (
        <PaintingPlaceholder
          activeCanvas={activeCanvas}
          setIsInteractive={setIsInteractive}
        />
      )}
      {isInteractive && (
        <div>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
            />
          ) : (
            painting && <ImageViewer body={painting} key={activeCanvas} />
          )}
        </div>
      )}
    </PaintingStyled>
  );
};

export default Painting;
