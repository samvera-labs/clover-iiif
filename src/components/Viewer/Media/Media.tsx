import {
  Canvas,
  CanvasNormalized,
  ExternalResourceTypes,
  InternationalString,
} from "@iiif/presentation-3";
import React, { useEffect, useMemo, useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import { CanvasEntity } from "src/hooks/use-iiif/getCanvasByCriteria";
import Slider from "src/components/Slider";
import Thumbnail from "src/components/Viewer/Media/Thumbnail";
import { getCanvasByCriteria } from "src/hooks/use-iiif";
import { getLabelAsString } from "src/lib/label-helpers";
import { getResourceType } from "src/hooks/use-iiif/getResourceType";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

interface MediaProps {
  items: Canvas[];
  activeItem: number;
}

/** One slide of the rail: a paged spread is a single group of one or two canvases. */
interface MediaGroup {
  id: string;
  indices: number[];
}

/**
 * Canvas navigation for the Viewer.
 *
 * The rail itself is the `Slider` — Clover maintains one carousel, not two. What stays
 * here is everything genuinely specific to navigating a Manifest: radio-group semantics,
 * paged spreads, label filtering, right-to-left order, and stepping by group.
 *
 * The division falls where the two uses actually differ. A slide is a *group*, not a
 * canvas, so a paged spread scrolls and snaps as the pair a reader sees. `renderItem`
 * draws that group, which is why the Slider needs to know nothing about canvases; and the
 * radio group stays out here as the ancestor, so each `Thumbnail` still resolves Radix's
 * context however deeply the carousel nests it.
 *
 * The controls went the same way. This used to draw its own bar, absolutely positioned over
 * the thumbnails and carrying a counter and a filter the Slider knew nothing about — so the
 * two control surfaces looked nothing alike. Both are the Slider's header now; the counter
 * and the filter are props, and what remains here is only what the Viewer alone can know:
 * that a step means a canvas, and what a query matches.
 */
const Media: React.FC<MediaProps> = ({ items }) => {
  const { t } = useCloverTranslation();
  const dispatch = useViewerDispatch();
  const state: ViewerContextStore = useViewerState();
  const {
    activeCanvas,
    configOptions,
    isPaged,
    vault,
    sequence,
    viewingDirection,
  } = state;

  const isRtlPaged = isPaged && viewingDirection === "right-to-left";

  const [filter, setFilter] = useState<string>("");
  const [mediaItems, setMediaItems] = useState<Array<CanvasEntity>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

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

  const handleFilter = (value: string) => setFilter(value);

  const handleCanvasToggle = (step: -1 | 1) => {
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

  /**
   * The groups that survive the label filter, as slides.
   *
   * Filtering is applied here rather than inside the rail: the Slider is handed the list
   * it should draw, so a filtered rail is simply a shorter one and the carousel re-measures
   * on the count change without knowing why.
   */
  const groups: MediaGroup[] = useMemo(
    () =>
      sequence[1]
        .filter((indices) =>
          indices.some((index) => {
            const id = sequence[0][index]?.id;
            const item = mediaItems.find((el) => el?.canvas?.id === id);
            if (!item) return false;
            if (!filter) return true;

            const label =
              getLabelAsString(item?.canvas?.label as InternationalString) ||
              "";
            return label.toLowerCase().includes(filter.toLowerCase());
          }),
        )
        .map((indices) => ({
          id: indices.map((index) => sequence[0][index]?.id).join("|"),
          indices,
        })),
    [sequence, mediaItems, filter],
  );

  /** Which slide holds the active canvas, so the rail can bring it into view. */
  const activeGroupIndex = useMemo(
    () =>
      groups.findIndex((group) =>
        group.indices.some((index) => sequence[0][index]?.id === activeCanvas),
      ),
    [groups, sequence, activeCanvas],
  );

  const renderGroup = (item: unknown) => {
    const group = item as MediaGroup;
    const isActiveGroup = group.indices.some(
      (index) => sequence[0][index]?.id === activeCanvas,
    );

    return (
      <div className="clover-viewer-media-group" data-active={isActiveGroup}>
        {group.indices.map((index) => {
          const id = sequence[0][index]?.id;
          const entity = mediaItems.find((el) => el?.canvas?.id === id);
          if (!entity) return null;

          return (
            <Thumbnail
              canvas={entity.canvas as CanvasNormalized}
              canvasIndex={mediaItems.findIndex((el) => el === entity)}
              handleChange={handleChange}
              isActive={activeCanvas === entity?.canvas?.id}
              key={entity?.canvas?.id}
              type={getResourceType(entity.annotations[0])}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Slider
      activeIndex={activeGroupIndex >= 0 ? activeGroupIndex : undefined}
      align="center"
      /*
       * Stated rather than left to the default. The spreads here are already grouped
       * from the Viewer's own `sequence`, which also accounts for viewing direction
       * and non-paged canvases; letting the Slider infer `paged` and group again
       * would pair the pairs.
       */
      behavior="individuals"
      dragFree
      isRtl={isRtlPaged}
      items={groups}
      /*
       * The Viewer filters, not the Slider. A slide here is a `MediaGroup` — a couple of
       * indices — with no label to match a query against; the labels live on the canvases
       * those indices point at, which only this component can reach.
       */
      onSearch={handleFilter}
      /*
       * Counted in canvases, though a slide may hold two of them. A reader of a paged
       * manuscript is on a page, not on a spread, and stepping moves by spread either way
       * because `handleCanvasToggle` walks `sequence`.
       */
      pager={{
        current: activeIndex + 1,
        total: items.length,
        onStep: handleCanvasToggle,
      }}
      presentational
      renderItem={renderGroup}
      search={configOptions.showMediaSearch}
      /*
       * One slide per snap. Embla's `scrollTo` addresses snap points, so without this
       * the group index handed to `activeIndex` would be multiplied by the breakpoint's
       * group size and the rail would fly several screens past the active spread.
       */
      slidesToScroll={1}
      /*
       * The radio group wraps the slides and nothing else. It has to be an ancestor of the
       * thumbnails for Radix to resolve them, but the header's buttons and filter field are
       * not radios and have no business inside a `radiogroup`.
       */
      wrapItems={(slides) => (
        <RadioGroup.Root
          aria-label={t("media.selectItem")}
          className="clover-viewer-media-sequence"
          data-testid="media"
          data-active-canvas={items[activeIndex]?.id}
          data-canvas-length={items.length}
          data-filter={filter}
          data-rtl-paged={isRtlPaged}
          style={{ direction: isRtlPaged ? "rtl" : "ltr" }}
        >
          {slides}
        </RadioGroup.Root>
      )}
    />
  );
};

export default Media;
