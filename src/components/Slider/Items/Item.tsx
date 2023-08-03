import { Anchor, ItemStyled } from "./Item.styled";
import React, { MouseEvent, useEffect, useState } from "react";

import Figure from "src/components/Slider/Figure/Figure";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import Placeholder from "./Placeholder";
import { SliderItem } from "src/types/slider";
import { getResponseStatus } from "src/lib/get-response-status";
import { useCollectionState } from "src/context/slider-context";

interface ItemProps {
  handleItemInteraction?: (item: SliderItem) => void;
  index: number;
  item: SliderItem;
}

const Item: React.FC<ItemProps> = ({ handleItemInteraction, index, item }) => {
  const store = useCollectionState();
  const { options } = store;
  const { credentials } = options;

  const [href, setHref] = useState<string>();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>();
  const [status, setStatus] = useState<number>(200);
  const [thumbnail, setThumbnail] = useState<IIIFExternalWebResource[]>([]);

  //console.log("placeholder", placeholder);

  useEffect(() => {
    if (item?.thumbnail && item?.thumbnail?.length > 0) {
      getResponseStatus(item, credentials).then((status) => {
        setStatus(status);
      });

      const { thumbnail } = item;
      setPlaceholder(thumbnail[0].id);
      setThumbnail(thumbnail as IIIFExternalWebResource[]);
    }
    if (item?.homepage && item.homepage?.length > 0)
      setHref(item.homepage[0].id);
  }, []);

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
        {placeholder && <Placeholder backgroundImage={placeholder} />}
        <Figure
          data-testid="slider-item-figure"
          index={index}
          isFocused={isFocused}
          key={item.id}
          label={item.label}
          summary={item.summary}
          status={status}
          thumbnail={thumbnail}
        />
      </Anchor>
    </ItemStyled>
  );
};

export default Item;
