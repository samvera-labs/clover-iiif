import React from "react";
import Player from "@/components/Player/Player";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
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
  const viewerState = useViewerState();

  return (
    <div>
      <button onClick={() => setIsInteractive(!isInteractive)}>
        Toggle state
      </button>
      {!isInteractive && (
        <div
          style={{
            background: "red",
            height: viewerState.configOptions.canvasHeight,
            width: "100%",
          }}
        ></div>
      )}
      {isInteractive && (
        <>
          {isMedia ? (
            <Player
              painting={painting as IIIFExternalWebResource}
              resources={resources}
            />
          ) : (
            painting && <ImageViewer body={painting} key={activeCanvas} />
          )}
        </>
      )}
    </div>
  );
};

export default Painting;
