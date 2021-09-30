import React, { useState, useEffect } from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useViewerState, useViewerDispatch } from "context/viewer-context";
import { getCanvasByCriteria, getThumbnail } from "services/iiif";

interface MediaProps {
  items: object[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items }) => {
  const dispatch: any = useViewerDispatch();
  const state: any = useViewerState();
  const { activeCanvas, vault } = state;

  const motivation = "painting";
  const paintingType = ["Image", "Sound", "Video"];

  const handleChange = (canvasId: string) => {
    if (activeCanvas !== canvasId)
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
  };

  const mediaItems: Array<any> = [];

  for (const item of items) {
    const canvasEntity = getCanvasByCriteria(
      vault,
      item,
      motivation,
      paintingType,
    );

    if (canvasEntity.annotations.length > 0) mediaItems.push(canvasEntity);
  }

  return (
    <MediaWrapper>
      {mediaItems.map((item: object) => (
        <MediaItem
          active={activeCanvas === item.canvas.id ? true : false}
          canvasEntity={item}
          thumbnail={getThumbnail(vault, item, 200, null)}
          key={item.canvas.id}
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
