import React from "react";
import MediaItem from "components/Media/MediaItem";
import { useViewerState, useViewerDispatch } from "context/viewer-context";
import {
  getCanvasByCriteria,
  getThumbnail,
} from "hooks/use-hyperion-framework";
import { CanvasEntity } from "hooks/use-hyperion-framework/getCanvasByCriteria";
import {
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
} from "@hyperion-framework/types";
import { MediaWrapper } from "./Media.styled";

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

export default Media;
