import {
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
  Reference,
} from "@iiif/presentation-3";
import React, { useEffect, useState } from "react";
import {
  StyledSequence,
  StyledSequenceGroup,
} from "src/components/Viewer/Media/Media.styled";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";
import { getCanvasByCriteria, getThumbnail } from "src/hooks/use-iiif";

import { CanvasEntity } from "src/hooks/use-iiif/getCanvasByCriteria";
import Controls from "src/components/Viewer/Media/Controls";
import Thumbnail from "src/components/Viewer/Media/Thumbnail";
import { getResourceType } from "src/hooks/use-iiif/getResourceType";
import { useTranslation } from "react-i18next";

interface MediaProps {
  items: Canvas[];
  activeItem: number;
  visibleCanvases: Reference<"Canvas">[];
}

const Media: React.FC<MediaProps> = ({ items, visibleCanvases }) => {
  const { t } = useTranslation();
  const dispatch: any = useViewerDispatch();
  const state: ViewerContextStore = useViewerState();
  const { activeCanvas, vault, sequence } = state;

  const [filter, setFilter] = useState<string>("");
  const [mediaItems, setMediaItems] = useState<Array<CanvasEntity>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const motivation = "painting";

  const handleChange = (canvasId: string) => {
    if (activeCanvas !== canvasId)
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
  };

  useEffect(() => {
    if (!mediaItems.length) {
      const paintingType: ExternalResourceTypes[] = ["Image", "Sound", "Video"];
      const entities: CanvasEntity[] = items
        .map((item) =>
          getCanvasByCriteria(vault, item, motivation, paintingType),
        )
        .filter((canvasEntity) => canvasEntity.annotations.length > 0);
      setMediaItems(entities);
    }
  }, [items, mediaItems.length, vault]);

  useEffect(() => {
    mediaItems.forEach((item, index) => {
      if (item?.canvas)
        if (item.canvas.id === activeCanvas) setActiveIndex(index);
    });
  }, [activeCanvas, mediaItems]);

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

  const handleFilter = (value: string) => setFilter(value);

  const handleCanvasToggle = (step: -1 | 1) => {
    // step needs to now account for sequence[1]
    const activeGroupIndex = sequence[1].findIndex((group) =>
      group.includes(activeIndex),
    );

    console.log("activeGroupIndex", activeGroupIndex);

    const canvasEntity = mediaItems[activeIndex + step];
    if (canvasEntity?.canvas) handleChange(canvasEntity.canvas.id);
  };

  return (
    <>
      <Controls
        handleFilter={handleFilter}
        handleCanvasToggle={handleCanvasToggle}
        activeIndex={activeIndex}
        canvasLength={items.length}
      />
      <StyledSequence
        aria-label={t("media.selectItem")}
        data-testid="media"
        data-active-canvas={items[activeIndex].id}
        data-canvas-length={items.length}
        data-filter={filter}
        ref={scrollRef}
      >
        {sequence[1].map((groups, index) => {
          const isActiveGroup = groups
            .map((index) => sequence[0][index].id)
            .includes(activeCanvas);

          return (
            <StyledSequenceGroup data-active={isActiveGroup} key={index}>
              {groups.map((index) => {
                const id = sequence[0][index].id;
                const item = mediaItems.find((el) => el?.canvas?.id === id);

                if (!item) return null;

                return (
                  <Thumbnail
                    canvas={item.canvas as CanvasNormalized}
                    canvasIndex={mediaItems.findIndex((el) => el === item)}
                    handleChange={handleChange}
                    isActive={activeCanvas === item?.canvas?.id ? true : false}
                    key={item?.canvas?.id}
                    thumbnail={getThumbnail(vault, item, 200, 200)}
                    type={getResourceType(item.annotations[0])}
                  />
                );
              })}
            </StyledSequenceGroup>
          );
        })}
      </StyledSequence>
    </>
  );
};

export default Media;
