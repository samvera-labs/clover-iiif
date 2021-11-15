import React from "react";
import { Group } from "./Media.styled";
import { CanvasEntity } from "hooks/use-hyperion-framework/getCanvasByCriteria";
import {
  getCanvasByCriteria,
  getThumbnail,
} from "hooks/use-hyperion-framework";
import {
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
} from "@hyperion-framework/types";
import { useViewerState, useViewerDispatch } from "context/viewer-context";
import Thumbnail from "./Thumbnail";
import { getResourceType } from "hooks/use-hyperion-framework/getResourceType";

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
    <Group aria-label="select item" data-testid="media">
      {mediaItems.map((item) => (
        <Thumbnail
          canvas={item.canvas as CanvasNormalized}
          handleChange={handleChange}
          isActive={activeCanvas === item?.canvas?.id ? true : false}
          key={item?.canvas?.id}
          thumbnail={getThumbnail(vault, item, 200, 200)}
          type={getResourceType(item.annotations[0])}
        />
      ))}
    </Group>
  );
};

export default Media;
