import React from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useViewerState, useViewerDispatch } from "context/viewer-context";
import { getCanvasByCriteria, CanvasEntity, getThumbnail } from "services/iiif";
import {
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
} from "@hyperion-framework/types";

interface MediaProps {
  items: Canvas[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items }) => {
  const dispatch: any = useViewerDispatch();
  const state: any = useViewerState();
  const { activeCanvas, vault } = state;

  const motivation = "painting";
  // TODO: Type this as an enum
  const paintingType: ExternalResourceTypes[] = ["Image", "Sound", "Video"];

  const handleChange = (canvasId: string) => {
    if (activeCanvas !== canvasId)
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
  };

  const mediaItems: Array<CanvasEntity> = [];

  for (const item of items) {
    const canvasEntity: CanvasEntity = getCanvasByCriteria(
      vault,
      item,
      motivation,
      paintingType,
    );

    if (canvasEntity.annotations.length > 0) mediaItems.push(canvasEntity);
  }

  return (
    <MediaWrapper>
      {mediaItems.map((item) => (
        <MediaItem
          active={activeCanvas === item?.canvas?.id ? true : false}
          canvas={item.canvas as CanvasNormalized}
          thumbnail={getThumbnail(vault, item, 200, 200)}
          key={item?.canvas?.id}
          handleChange={handleChange}
        />
      ))}
    </MediaWrapper>
  );
};

const MediaWrapper = styled("nav", {
  display: "flex",
  flexDirection: "row",
  flexGrow: "1",
  padding: "1.618rem 0.618rem 1.618rem 0 ",
  overflowX: "scroll",
  backgroundColor: "white",
});

export default Media;
