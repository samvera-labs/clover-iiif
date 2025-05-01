import { A11y, Navigation } from "swiper";
import React, { useRef } from "react";
import { SliderItem, SwiperBreakpoints } from "src/types/slider";
import { Swiper, SwiperSlide } from "swiper/react";

import { CollectionItems } from "@iiif/presentation-3";
import Item from "./Item";
import { ItemsStyled } from "src/components/Slider/Items/Items.styled";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";

interface ItemsProps {
  breakpoints?: SwiperBreakpoints;
  handleItemInteraction?: (item: SliderItem) => void;
  instance: number;
  items: CollectionItems[];
}

const defaultBreakpoints = {
  640: {
    slidesPerView: 2,
    slidesPerGroup: 2,
    spaceBetween: 20,
  },
  768: {
    slidesPerView: 3,
    slidesPerGroup: 3,
    spaceBetween: 30,
  },
  1024: {
    slidesPerView: 4,
    slidesPerGroup: 4,
    spaceBetween: 40,
  },
  1366: {
    slidesPerView: 5,
    slidesPerGroup: 5,
    spaceBetween: 50,
  },
  1920: {
    slidesPerView: 6,
    slidesPerGroup: 6,
    spaceBetween: 60,
  },
};

const Items: React.FC<ItemsProps> = ({
  breakpoints = defaultBreakpoints,
  handleItemInteraction,
  instance,
  items,
}) => {
  const itemsRef = useRef<HTMLDivElement>(null);

  return (
    <ItemsStyled ref={itemsRef}>
      <Swiper
        // @ts-ignore
        a11y={{
          prevSlideMessage: "previous item",
          nextSlideMessage: "next item",
        }}
        spaceBetween={31}
        modules={[Navigation, A11y]}
        navigation={{
          nextEl: `.clover-slider-next-${instance}`,
          prevEl: `.clover-slider-previous-${instance}`,
        }}
        slidesPerView={2}
        slidesPerGroup={2}
        breakpoints={breakpoints}
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={`${item.id}-${index}`}
            data-index={index}
            data-type={item?.type.toLowerCase()}
          >
            <LazyLoad>
              <Item
                handleItemInteraction={handleItemInteraction}
                index={index}
                item={item as SliderItem}
              />
            </LazyLoad>
          </SwiperSlide>
        ))}
      </Swiper>
    </ItemsStyled>
  );
};

export default Items;
