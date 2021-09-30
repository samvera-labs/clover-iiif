import React from "react";
import { styled } from "@stitches/react";
import MediaItem from "components/Media/MediaItem";
import { useViewerState, useViewerDispatch } from "context/viewer-context";
import { getCanvasEntities } from "services/iiif";

interface MediaProps {
  items: object[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items, activeItem }) => {
  const dispatch: any = useViewerDispatch();
  const state: any = useViewerState();
  const { activeCanvas, vault } = state;

  const motivation = "painting";
  const paintingType = ["Image", "Video"];

  const handleChange = (canvasId: string) => {
    if (activeCanvas !== canvasId)
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
  };

  return (
    <MediaWrapper>
      {items.map((item: object, key: number) => {
        // this probably needs to be written in a .filter()
        const canvases: object = getCanvasEntities(
          vault,
          item,
          motivation,
          paintingType,
        );

        if (canvases !== undefined)
          return (
            <MediaItem
              key={key}
              normalized={normalized}
              active={true}
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
