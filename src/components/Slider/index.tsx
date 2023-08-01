import React, { useEffect, useState } from "react";
import {
  Collection,
  CollectionItems,
  CollectionNormalized,
  ContentResource,
  InternationalString,
  Manifest,
} from "@iiif/presentation-3";
import {
  CollectionProvider,
  defaultState,
  useCollectionState,
} from "src/context/slider-context";
import { ConfigOptions } from "src/types/slider";
import Header from "src/components/Slider/Header/Header";
import Items from "src/components/Slider/Items/Items";
import hash from "src/lib/hash";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "src/components/Slider/ErrorFallback/ErrorFallback";
import { upgrade } from "@iiif/parser/upgrader";

export interface CloverSliderProps {
  collectionId: string;
  onItemInteraction?: (item: Manifest | Collection) => void;
  options?: ConfigOptions;
}

const CloverSlider: React.FC<CloverSliderProps> = (props) => (
  <CollectionProvider
    initialState={{
      ...defaultState,
      options: { ...props.options },
    }}
  >
    <RenderSlider {...props} />
  </CollectionProvider>
);

const RenderSlider: React.FC<CloverSliderProps> = ({
  collectionId,
  onItemInteraction,
}) => {
  const store = useCollectionState();
  const { options } = store;
  const [collection, setCollection] = useState<CollectionNormalized>();

  useEffect(() => {
    if (!collectionId) return;
    fetch(collectionId)
      .then((response) => response.json())
      .then(upgrade)
      .then((data: any) => setCollection(data))
      .catch((error: any) => {
        console.error(
          `The IIIF Collection ${collectionId} failed to load: ${error}`
        );
      });
  }, [collectionId]);

  if (collection?.items.length === 0) {
    console.log(`The IIIF Collection ${collectionId} does not contain items.`);
    return <></>;
  }

  const instance = hash(collectionId);

  if (!collection) return <></>;

  return (
    <div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
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
      </ErrorBoundary>
    </div>
  );
};

export default CloverSlider;
