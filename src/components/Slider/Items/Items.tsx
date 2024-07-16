import { A11y, Navigation } from "swiper";
import { SliderItem, SwiperBreakpoints } from "src/types/slider";
import { Swiper, SwiperSlide } from "swiper/react";

import { CollectionItems } from "@iiif/presentation-3";
import Item from "./Item";
import React from "react";

interface ItemsProps {
  breakpoints?: SwiperBreakpoints;
  instance: number;
  items: CollectionItems[];
}

const defaultBreakpoints = {
  640: {
    slidesPerView: 2,
    slidesPerGroup: 2,
    spaceBetween: 15,
  },
  768: {
    slidesPerView: 3,
    slidesPerGroup: 3,
    spaceBetween: 15,
  },
  1024: {
    slidesPerView: 4,
    slidesPerGroup: 4,
    spaceBetween: 20,
  },
  1366: {
    slidesPerView: 5,
    slidesPerGroup: 5,
    spaceBetween: 25,
  },
  1920: {
    slidesPerView: 6,
    slidesPerGroup: 6,
    spaceBetween: 35,
  },
};

const Items: React.FC<ItemsProps> = ({
  breakpoints = defaultBreakpoints,
  instance,
  items,
}) => {
  return (
    <Swiper
      // @ts-ignore
      a11y={{
        prevSlideMessage: "previous item",
        nextSlideMessage: "next item",
      }}
      breakpoints={breakpoints}
      modules={[Navigation, A11y]}
      navigation={{
        nextEl: `.clover-slider-next-${instance}`,
        prevEl: `.clover-slider-previous-${instance}`,
      }}
      spaceBetween={25}
    >
      {items.map((item, index) => (
        <SwiperSlide
          key={`${item.id}-${index}`}
          data-index={index}
          data-type={item?.type.toLowerCase()}
        >
          <Item index={index} item={item as SliderItem} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Items;
