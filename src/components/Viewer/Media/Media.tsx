import {
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
  InternationalString,
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

import { CanvasEntity } from "src/hooks/use-iiif/getCanvasByCriteria";
import Controls from "src/components/Viewer/Media/Controls";
import Thumbnail from "src/components/Viewer/Media/Thumbnail";
import { getCanvasByCriteria } from "src/hooks/use-iiif";
import { getLabelAsString } from "src/lib/label-helpers";
import { getResourceType } from "src/hooks/use-iiif/getResourceType";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

interface MediaProps {
  items: Canvas[];
  activeItem: number;
}

const Media: React.FC<MediaProps> = ({ items }) => {
  const { t } = useCloverTranslation();
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
    // get active group index
    const activeGroupIndex = sequence[1].findIndex((group) =>
      group.includes(activeIndex),
    );

    const targetGroupIndex =
      activeGroupIndex + step >= 0
        ? activeGroupIndex + step
        : sequence[1].length - 1;

    if (!sequence[1][targetGroupIndex]) return;

    const targetIndex = sequence[1][targetGroupIndex][0];
    const targetCanvas = sequence[0][targetIndex].id;

    if (targetCanvas) handleChange(targetCanvas);
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
        {sequence[1]
          .filter((groups) => {
            return groups.some((index) => {
              const id = sequence[0][index].id;
              const item = mediaItems.find((el) => el?.canvas?.id === id);
              if (!item) return false;

              const label =
                getLabelAsString(item?.canvas?.label as InternationalString) ||
                "";
              if (filter && !label.toLowerCase().includes(filter.toLowerCase()))
                return false;

              return true;
            });
          })
          .map((groups, index) => {
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
                      isActive={
                        activeCanvas === item?.canvas?.id ? true : false
                      }
                      key={item?.canvas?.id}
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
