import React, { useState, useEffect } from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useViewerState, useViewerDispatch } from "context/viewer-context";

import { getCanvasByCriteria, getThumbnail } from "services/iiif";
import {
  Annotation,
  AnnotationPageNormalized,
  CanvasNormalized,
} from "@hyperion-framework/types";

interface MediaProps {
  items: object[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items, activeItem }) => {
  const dispatch: any = useViewerDispatch();
  const state: any = useViewerState();
  const { activeCanvas, vault } = state;
  const [mediaItems, setMediaItems] = useState([]);

  const motivation = "painting";
  const paintingType = ["Image", "Sound", "Video"];

  const handleChange = (canvasId: string) => {
    if (activeCanvas !== canvasId)
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
  };

  for (const item of items) {
    const canvasEntity = getCanvasByCriteria(
      vault,
      item,
      motivation,
      paintingType,
    );

    if (canvasEntity.annotations.length > 0) {
      useEffect(() => {
        setMediaItems((mediaItems) => [...mediaItems, canvasEntity]);
      }, []);
    }
  }

  return (
    <MediaWrapper>
      {mediaItems.map((item: object) => {
        return (
          <MediaItem
            active={activeCanvas === item.canvas.id ? true : false}
            canvasEntity={item}
            thumbnail={getThumbnail(vault, item, 200, null)}
            key={item.canvas.id}
            handleChange={handleChange}
          />
        );
      })}
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
