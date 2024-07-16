import Figure from "src/components/Slider/Figure/Figure";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import React from "react";
import { SliderItem } from "src/types/slider";

interface ItemProps {
  index: number;
  item: SliderItem;
}

const Item: React.FC<ItemProps> = ({ index, item }) => {
  let thumbnail: IIIFExternalWebResource[] = [];
  let href: string = "#";

  if (item?.thumbnail && item?.thumbnail?.length > 0)
    thumbnail = item.thumbnail as IIIFExternalWebResource[];

  if (item?.homepage && item.homepage?.length > 0)
    href = item.homepage[0].id as string;

  return (
    <div data-testid="slider-item">
      <Figure
        data-testid="slider-item-figure"
        key={item.id}
        href={href}
        label={item.label}
        summary={item.summary}
        thumbnail={thumbnail}
      />
    </div>
  );
};

export default Item;
