import React, { useEffect, useState } from "react";
import { Select, SelectOption } from "src/components/UI/Select";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import { CollectionItems, CollectionNormalized } from "@iiif/presentation-3";
import {
  ErrorStyled,
  FooterStyled,
  LoadMoreButtonStyled,
} from "src/components/Viewer/Collection/Collection.styled";
import { getCollectionNext } from "src/hooks/use-iiif";
import { v4 as uuidv4 } from "uuid";

const Collection: React.FC = () => {
  const dispatch: any = useViewerDispatch();
  const viewerState: any = useViewerState();

  const { activeManifest, collection, configOptions, vault } = viewerState;
  const maxHeight = configOptions?.canvasHeight;

  const [extraItems, setExtraItems] = useState<CollectionItems[]>([]);
  const [nextUrl, setNextUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setExtraItems([]);
    setLoadError(undefined);
    setNextUrl(getCollectionNext(collection));
  }, [collection, vault]);

  const handleValueChange = (manifestId: string) => {
    dispatch({
      type: "updateActiveCanvas",
      canvasId: undefined,
    });
    dispatch({
      type: "updateActiveManifest",
      manifestId: manifestId,
    });
    dispatch({
      type: "updateViewerId",
      viewerId: uuidv4(),
    });
  };

  const handleLoadMore = async () => {
    if (!nextUrl || isLoading) return;
    setIsLoading(true);
    setLoadError(undefined);
    try {
      const next = (await vault.load(nextUrl)) as
        | CollectionNormalized
        | undefined;
      if (!next) throw new Error("Empty response");
      const nextPointer = getCollectionNext(next);
      // strip the trailing next-page Collection from the appended items so it
      // doesn't render as a Manifest entry, and filter out any nested
      // Collection entries (only Manifests should appear in the picker).
      const newItems = ((next.items ?? []) as CollectionItems[]).filter(
        (i) => i.type !== "Collection",
      );
      // dedupe inside the functional updater so we read fresh `prev` rather
      // than the stale `extraItems` captured by this closure.
      setExtraItems((prev) => {
        const seen = new Set<string>();
        collection?.items?.forEach((i: CollectionItems) => seen.add(i.id));
        prev.forEach((i) => seen.add(i.id));
        return [...prev, ...newItems.filter((i) => !seen.has(i.id))];
      });
      setNextUrl(nextPointer);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load next page",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // visible items: parent items minus the trailing next-page Collection,
  // plus any items appended from subsequent pages (also stripped of their
  // trailing next pointers, which getCollectionNext on each fetched page
  // moves into nextUrl rather than extraItems).
  const baseItems: CollectionItems[] = (collection?.items ?? []).filter(
    (item: CollectionItems) => item.type !== "Collection",
  );
  const allItems = [...baseItems, ...extraItems];

  const footer =
    nextUrl || loadError ? (
      <FooterStyled
        className="clover-viewer-collection-footer"
        // Stop Radix Select from intercepting pointer/key events on the
        // footer's interactive children (otherwise the dropdown closes
        // before the click reaches the button).
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {nextUrl && (
          <LoadMoreButtonStyled
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            data-testid="collection-load-more"
            className="clover-viewer-collection-load-more"
          >
            {isLoading ? "Loading…" : "Load more"}
          </LoadMoreButtonStyled>
        )}
        {loadError && (
          <ErrorStyled role="alert" data-testid="collection-load-error">
            {loadError}
          </ErrorStyled>
        )}
      </FooterStyled>
    ) : undefined;

  return (
    <div style={{ margin: "0.75rem" }}>
      <Select
        label={collection.label}
        maxHeight={maxHeight}
        value={activeManifest}
        onValueChange={handleValueChange}
        footer={footer}
      >
        {allItems.map((item: CollectionItems) => (
          <SelectOption
            value={item.id}
            key={item.id}
            thumbnail={item?.thumbnail ? vault.get(item?.thumbnail) : undefined}
            label={item.label}
          />
        ))}
      </Select>
    </div>
  );
};

export default Collection;
