import React from "react";
import { Reference } from "@iiif/presentation-3";
import ScrollItem from "src/components/Scroll/Items/Item";
import { StyledScrollItems } from "src/components/Scroll/Items/Items.styled";

const ScrollItems = ({ items }: { items: Reference<"Canvas">[] }) => {
  return (
    <StyledScrollItems>
      {items.map((item, index) => {
        const itemNumber = index + 1;
        const isLastItem = itemNumber === items.length;

        return (
          <ScrollItem
            item={item}
            hasItemBreak={itemNumber < items.length}
            isLastItem={isLastItem}
            key={item.id}
            itemCount={items.length}
            itemNumber={itemNumber}
          />
        );
      })}
    </StyledScrollItems>
  );
};

export default ScrollItems;
