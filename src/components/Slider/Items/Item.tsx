import { Anchor, ItemStyled } from "./Item.styled";
import React, { MouseEvent, useState } from "react";

import Figure from "src/components/Slider/Figure/Figure";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import Placeholder from "./Placeholder";
import { SliderItem } from "src/types/slider";

interface ItemProps {
  handleItemInteraction?: (item: SliderItem) => void;
  index: number;
  item: SliderItem;
}

const Item: React.FC<ItemProps> = ({ handleItemInteraction, index, item }) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  let thumbnail: IIIFExternalWebResource[] = [];
  let href: string = "#";

  if (item?.thumbnail && item?.thumbnail?.length > 0)
    thumbnail = item.thumbnail as IIIFExternalWebResource[];

  if (item?.homepage && item.homepage?.length > 0)
    href = item.homepage[0].id as string;

  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);

  /**
   * if a handleItemInteraction() callback is present
   * pass `item` object up to consuming application.
   * if not, allow browser to route user to href value.
   */
  const handleAnchorClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!handleItemInteraction) return;

    e.preventDefault();
    handleItemInteraction(item);
  };

  return (
    <ItemStyled data-testid="slider-item">
      <Anchor
        data-testid="slider-item-anchor"
        href={href}
        onClick={handleAnchorClick}
        tabIndex={0}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={onFocus}
        onMouseLeave={onBlur}
      >
        <Placeholder backgroundImage="" />
        <Figure
          data-testid="slider-item-figure"
          index={index}
          isFocused={isFocused}
          key={item.id}
          label={item.label}
          summary={item.summary}
          thumbnail={thumbnail}
        />
      </Anchor>
    </ItemStyled>
  );
};

export default Item;
