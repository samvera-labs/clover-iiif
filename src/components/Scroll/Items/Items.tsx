import React from "react";
import { Reference } from "@iiif/presentation-3";
import ScrollItem from "src/components/Scroll/Items/Item";
import { ScrollContext } from "src/context/scroll-context";
import { StyledScrollItems } from "src/components/Scroll/Items/Items.styled";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";

const ScrollItems = ({ items }: { items: Reference<"Canvas">[] }) => {
  const { state } = React.useContext(ScrollContext);
  const { annotations, annotationsLoading } = state;
  const annotationsReady = !annotationsLoading && annotations !== undefined;

  if (!annotationsReady) return null;

  return (
    <StyledScrollItems>
      {items.map((item, index) => {
        const itemNumber = index + 1;
        const isLastItem = itemNumber === items.length;

        return (
          <LazyLoad key={index}>
            <ScrollItem
              item={item}
              hasItemBreak={itemNumber < items.length}
              isLastItem={isLastItem}
              key={item.id}
              itemCount={items.length}
              itemNumber={itemNumber}
            />
          </LazyLoad>
        );
      })}
    </StyledScrollItems>
  );
};

export default ScrollItems;
