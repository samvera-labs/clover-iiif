import React from "react";

import { CollectionItems } from "@iiif/presentation-3";
import Item from "./Item";
import { ItemsStyled } from "src/components/Slider/Items/Items.styled";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";
import { SliderItem } from "src/types/slider";
import { type BreakpointConfig } from "src/components/Slider/useBreakpoints";
import { type UseTrackApi } from "src/components/Shared/Track/useTrack";

interface ItemsProps {
  /** Zero the gutter, for `continuous` sequences that read as one unbroken object. */
  seamless?: boolean;
  config: BreakpointConfig;
  handleItemInteraction?: (item: SliderItem) => void;
  /**
   * Slides, each holding one or more items. A `paged` sequence puts two items in a slide
   * so a spread scrolls and snaps as the pair a reader sees; everything else is one.
   */
  slides: unknown[][];
  /**
   * Render a slide's contents. Without it each item is a linked figure, which is what a
   * Collection wants; the Viewer supplies its own so a slide can be a radio-selectable
   * canvas — or a group of them — instead.
   */
  renderItem?: (item: unknown, index: number) => React.ReactNode;
  /**
   * Drop the carousel roles when the host supplies its own semantics.
   *
   * The Viewer's rail sits inside a `radiogroup`, and a `role="group"` per slide between
   * that group and its radios is both invalid nesting and enough to stop Radix handing
   * out its single roving tab stop — which left the rail unreachable by keyboard.
   */
  presentational?: boolean;
  track: UseTrackApi;
}

/**
 * The slide row.
 *
 * Layout is CSS and paging is the shared track hook. What a slide *contains* is the
 * caller's business — see `renderItem`.
 */
const Items: React.FC<ItemsProps> = ({
  config,
  handleItemInteraction,
  presentational = false,
  renderItem,
  seamless = false,
  slides,
  track,
}) => {
  const spaceBetween = seamless ? "0px" : config.spaceBetween;
  /** Running index across the flat sequence, for labels and `renderItem`. */
  let itemIndex = -1;

  /*
   * `columns` divides the viewport into equal slides, which suits a Collection of evenly
   * cropped figures. `auto` lets each slide take its natural width — needed for canvas
   * thumbnails, whose aspect ratios vary and which would be distorted by a fixed column.
   */
  return (
    <ItemsStyled
      ref={track.ref}
      {...(!presentational && { "aria-roledescription": "carousel" })}
      data-testid="slider-items"
    >
      <div
        className="clover-slider-track"
        style={{
          display: "flex",
          width: "100%",
          gap: spaceBetween,
        }}
      >
        {slides.map((slide, slideIndex) => {
          return (
            <div
              key={(slide[0] as { id?: string })?.id ?? slideIndex}
              className="clover-slider-slide"
              data-index={slideIndex}
              data-track-index={slideIndex}
              data-slide-items={slide.length}
              data-type={(slide[0] as { type?: string })?.type?.toLowerCase()}
              {...(!presentational && {
                role: "group",
                "aria-roledescription": "slide",
                "aria-label": `${slideIndex + 1} of ${slides.length}`,
              })}
              /*
               * Content-sized, never a fraction of the viewport. Each item declares its
               * own width — the card via `--clover-slider-item-width`, a canvas thumbnail
               * via its own figure — so a slide is as wide as what it holds and the track
               * is the sum of them. How many fit is then a consequence of the viewport
               * rather than something divided into it.
               */
              style={{ flex: "0 0 auto", minWidth: 0 }}
            >
              {/* A slide holding a spread lays its pages out side by side. */}
              <div
                className="clover-slider-slide-items"
                style={{
                  display: "flex",
                  /*
                   * Flush, not gutter-spaced. The gutter belongs *between* slides; using
                   * it inside one too would put a recto and verso exactly as far apart as
                   * two unrelated items, and the pairing would not read as a pairing.
                   */
                  gap: slide.length > 1 ? "0px" : spaceBetween,
                  width: "100%",
                }}
              >
                {slide.map((item) => {
                  itemIndex += 1;
                  const index = itemIndex;
                  return renderItem ? (
                    <React.Fragment
                      key={(item as { id?: string })?.id ?? index}
                    >
                      {renderItem(item, index)}
                    </React.Fragment>
                  ) : (
                    <LazyLoad key={(item as { id?: string })?.id ?? index}>
                      <Item
                        handleItemInteraction={handleItemInteraction}
                        index={index}
                        item={item as SliderItem}
                      />
                    </LazyLoad>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ItemsStyled>
  );
};

export type { CollectionItems };
export default Items;
