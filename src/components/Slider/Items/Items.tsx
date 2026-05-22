import React, { useCallback, useEffect, useState } from "react";

import { CollectionItems } from "@iiif/presentation-3";
import Item from "./Item";
import { ItemsStyled } from "src/components/Slider/Items/Items.styled";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";
import { SliderItem, SliderBreakpoints } from "src/types/slider";
import useEmblaCarousel from "embla-carousel-react";

interface ItemsProps {
  breakpoints?: SliderBreakpoints;
  handleItemInteraction?: (item: SliderItem) => void;
  instance: number;
  items: CollectionItems[];
}

const defaultBreakpoints: SliderBreakpoints = {
  640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 20 },
  768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 30 },
  1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 40 },
  1366: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 50 },
  1920: { slidesPerView: 6, slidesPerGroup: 6, spaceBetween: 60 },
};

/**
 * Pick the breakpoint config that applies to the current window width by
 * matching the largest min-width breakpoint that is <= window.innerWidth.
 */
const resolveBreakpoint = (breakpoints: SliderBreakpoints) => {
  if (typeof window === "undefined") {
    return { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 31 };
  }
  const width = window.innerWidth;
  const sorted = Object.entries(breakpoints)
    .map(([k, v]) => [Number(k), v] as const)
    .sort((a, b) => a[0] - b[0]);
  let active = { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 31 };
  for (const [min, config] of sorted) {
    if (width >= min) active = { ...active, ...config };
  }
  return active;
};

const Items: React.FC<ItemsProps> = ({
  breakpoints = defaultBreakpoints,
  handleItemInteraction,
  instance,
  items,
}) => {
  const [config, setConfig] = useState(() => resolveBreakpoint(breakpoints));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: config.slidesPerGroup,
    containScroll: "trimSnaps",
  });

  // Update slidesToScroll on window resize so the active breakpoint stays in
  // sync with the column count rendered by CSS below.
  useEffect(() => {
    const onResize = () => setConfig(resolveBreakpoint(breakpoints));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoints]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ slidesToScroll: config.slidesPerGroup });
  }, [emblaApi, config.slidesPerGroup]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Wire up the externally-rendered prev/next buttons in <Header /> and keep
  // their disabled state in sync with Embla's scroll bounds.
  useEffect(() => {
    if (!emblaApi) return;

    const prev = document.querySelector<HTMLButtonElement>(
      `.clover-slider-previous-${instance}`,
    );
    const next = document.querySelector<HTMLButtonElement>(
      `.clover-slider-next-${instance}`,
    );

    const updateDisabled = () => {
      if (prev) prev.disabled = !emblaApi.canScrollPrev();
      if (next) next.disabled = !emblaApi.canScrollNext();
    };

    prev?.addEventListener("click", scrollPrev);
    next?.addEventListener("click", scrollNext);
    emblaApi.on("select", updateDisabled);
    emblaApi.on("reInit", updateDisabled);
    updateDisabled();

    return () => {
      prev?.removeEventListener("click", scrollPrev);
      next?.removeEventListener("click", scrollNext);
      emblaApi.off("select", updateDisabled);
      emblaApi.off("reInit", updateDisabled);
    };
  }, [emblaApi, instance, scrollPrev, scrollNext]);

  return (
    <ItemsStyled
      ref={emblaRef}
      aria-roledescription="carousel"
      data-testid="slider-items"
    >
      <div
        className="clover-slider-track"
        style={{
          display: "flex",
          width: "100%",
          gap: `${config.spaceBetween}px`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="clover-slider-slide"
            data-index={index}
            data-type={item?.type.toLowerCase()}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
            style={{
              flex: `0 0 calc((100% - ${config.spaceBetween * (config.slidesPerView - 1)}px) / ${config.slidesPerView})`,
              minWidth: 0,
              width: `calc((100% - ${config.spaceBetween * (config.slidesPerView - 1)}px) / ${config.slidesPerView})`,
            }}
          >
            <LazyLoad>
              <Item
                handleItemInteraction={handleItemInteraction}
                index={index}
                item={item as SliderItem}
              />
            </LazyLoad>
          </div>
        ))}
      </div>
    </ItemsStyled>
  );
};

export default Items;
