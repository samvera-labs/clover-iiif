import { Anchor, ItemStyled } from "./Item.styled";
import {
  Collection,
  IIIFExternalWebResource,
  Manifest,
} from "@iiif/presentation-3";
import React, { MouseEvent, useEffect, useState } from "react";
import Figure from "src/components/Slider/Figure/Figure";
import Placeholder from "./Placeholder";
import { getCanvasResource } from "src/lib/iiif";
import { useCollectionState } from "src/context/slider-context";
import { upgrade } from "@iiif/parser/upgrader";

interface ItemProps {
  handleItemInteraction?: (item: Collection | Manifest) => void;
  index: number;
  item: Collection | Manifest;
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

  useEffect(() => {
    if (item && item?.thumbnail && item.thumbnail?.length > 0) {
      fetch(item?.id)
        .then((response) => response.json())
        .then(upgrade)
        .then((manifest: any) => {
          if (manifest?.type === "Manifest") {
            const id = getCanvasResource(manifest?.items[0]);
            if (id) {
              fetch(id, {
                method: "GET",
                headers: {
                  accept: "image/*",
                },
                credentials: credentials,
              })
                .then((response) => {
                  setStatus(response.status);
                })
                .catch((error) => setStatus(error.status));
            }
          }
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
    <ItemStyled>
      <Anchor
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
