import React, { DOMElement, useEffect, useState } from "react";
import { Group } from "./Media.styled";
import { CanvasEntity } from "hooks/use-hyperion-framework/getCanvasByCriteria";
import {
  getCanvasByCriteria,
  getLabel,
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
import Controls from "./Controls";

interface MediaProps {
  items: Canvas[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items }) => {
  const dispatch: any = useViewerDispatch();
  const state: any = useViewerState();
  const { activeCanvas, vault } = state;

  const [filter, setFilter] = useState<String>("");
  const [mediaItems, setMediaItems] = useState<Array<CanvasEntity>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const scrollRef = React.useRef<HTMLElement>();

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

  useEffect(() => {
    for (const item of items) {
      const canvasEntity: CanvasEntity = getCanvasByCriteria(
        vault,
        item,
        motivation,
        paintingType,
      );

      if (canvasEntity.annotations.length > 0)
        setMediaItems((mediaItems) => [...mediaItems, canvasEntity]);
    }
  }, []);

  useEffect(() => {
    mediaItems.forEach((item, index) => {
      if (item?.canvas)
        if (item.canvas.id === activeCanvas) setActiveIndex(index);
    });
  }, [activeCanvas]);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(
      `[data-canvas="${activeIndex}"]`,
    ) as Element;

    if (element instanceof HTMLElement && scrollRef.current) {
      const leftPos =
        element.offsetLeft -
        scrollRef.current.offsetWidth / 2 +
        element.offsetWidth / 2;
      scrollRef.current.scrollTo({ left: leftPos, behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleFilter = (value: String) => setFilter(value);

  const handleCanvasToggle = (step: -1 | 1) => {
    const canvasEntity = mediaItems[activeIndex + step];
    if (canvasEntity?.canvas) handleChange(canvasEntity.canvas.id);
  };

  return (
    <>
      <Controls
        handleFilter={handleFilter}
        handleCanvasToggle={handleCanvasToggle}
        activeIndex={activeIndex}
        canvasLength={mediaItems.length}
      />
      <Group aria-label="select item" data-testid="media" ref={scrollRef}>
        {mediaItems
          .filter((item) => {
            if (item.canvas?.label) {
              const label = getLabel(item.canvas.label);
              if (Array.isArray(label))
                return label[0].toLowerCase().includes(filter.toLowerCase());
            }
          })
          .map((item, index) => (
            <Thumbnail
              canvas={item.canvas as CanvasNormalized}
              canvasIndex={index}
              handleChange={handleChange}
              isActive={activeCanvas === item?.canvas?.id ? true : false}
              key={item?.canvas?.id}
              thumbnail={getThumbnail(vault, item, 200, 200)}
              type={getResourceType(item.annotations[0])}
            />
          ))}
      </Group>
    </>
  );
};

export default Media;
