import React from "react";
import { Reference } from "@iiif/presentation-3";
import ScrollItem from "src/components/Scroll/Items/Item";
import { ScrollContext } from "src/context/scroll-context";
import { scrollItems } from "src/components/Scroll/Items/Items.css";
import LazyLoad from "src/components/UI/LazyLoad/LazyLoad";

const ScrollItems = ({ items }: { items: Reference<"Canvas">[] }) => {
  const { state } = React.useContext(ScrollContext);
  const { annotations, annotationsLoading } = state;
  const annotationsReady = !annotationsLoading && annotations !== undefined;

  if (!annotationsReady) return null;

  return (
    <div className={scrollItems}>
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
    </div>
  );
};

export default ScrollItems;
