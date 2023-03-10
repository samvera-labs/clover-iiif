import React from "react";
import Player from "@/components/Player/Player";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { LabeledResource } from "@/hooks/use-iiif/getSupplementingResources";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import { useViewerState } from "@/context/viewer-context";
import { getThumbnail } from "@/hooks/use-iiif";

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
  const size = configOptions.canvasHeight;

  const normalizedCanvas = vault.get(activeCanvas);
  console.log("normalizedCanvas", normalizedCanvas);
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
  console.log("isInteractive", isInteractive);

  return (
    <div>
      {!isInteractive && (
        <button onClick={() => setIsInteractive(true)}>
          <img src={thumbnail.id} alt="Something" height={size} width={size} />
        </button>
      )}
      {isInteractive && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsInteractive(false)}
            style={{
              position: "absolute",
              right: "0",
              bottom: "0",
              zIndex: 100,
            }}
          >
            Toggle
          </button>
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
    </div>
  );
};

export default Painting;
