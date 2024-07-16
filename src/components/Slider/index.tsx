import "@radix-ui/themes/styles.css";

import {
  CollectionItems,
  CollectionNormalized,
  ContentResource,
  InternationalString,
} from "@iiif/presentation-3";
import {
  CollectionProvider,
  defaultState,
  useCollectionState,
} from "src/context/slider-context";
import { type ConfigOptions, type SliderItem } from "src/types/slider";
import React, { useEffect, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/Slider/ErrorFallback/ErrorFallback";
import Header from "src/components/Slider/Header/Header";
import Items from "src/components/Slider/Items/Items";
import hash from "src/lib/hash";
import { upgrade } from "@iiif/parser/upgrader";
import { Theme } from "@radix-ui/themes";

export interface CloverSliderProps {
  collectionId?: string;
  iiifContent: string;
  onItemInteraction?: (item: SliderItem) => void;
  options?: ConfigOptions;
}

const CloverSlider: React.FC<CloverSliderProps> = (props) => {
  return (
    <CollectionProvider
      initialState={{
        ...defaultState,
        options: { ...props.options },
      }}
    >
      <RenderSlider {...props} />
    </CollectionProvider>
  );
};

const RenderSlider: React.FC<CloverSliderProps> = ({
  collectionId,
  iiifContent,
  onItemInteraction,
}) => {
  const store = useCollectionState();
  const { options } = store;
  const [collection, setCollection] = useState<CollectionNormalized>();

  let iiifResource = iiifContent;
  if (collectionId) iiifResource = collectionId;

  useEffect(() => {
    if (!iiifResource) return;
    fetch(iiifResource)
      .then((response) => response.json())
      .then(upgrade)
      .then((data: any) => setCollection(data))
      .catch((error: any) => {
        console.error(
          `The IIIF Collection ${iiifResource} failed to load: ${error}`,
        );
      });
  }, [iiifResource]);

  if (collection?.items.length === 0) {
    console.log(`The IIIF Collection ${iiifResource} does not contain items.`);
    return <></>;
  }

  const instance = hash(iiifResource);

  if (!collection) return <></>;

  return (
    <div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Theme className="clover-theme clover-theme--slider">
          <Header
            label={collection.label as InternationalString}
            summary={
              collection && collection.summary
                ? collection.summary
                : { none: [""] }
            }
            homepage={collection.homepage as any as ContentResource[]}
            instance={instance}
          />
          <Items
            items={collection.items as CollectionItems[]}
            handleItemInteraction={onItemInteraction}
            instance={instance}
            breakpoints={options.breakpoints}
          />
        </Theme>
      </ErrorBoundary>
    </div>
  );
};

export default CloverSlider;
