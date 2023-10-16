import { Select, SelectOption } from "src/components/internal/Select";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import { CollectionItems } from "@iiif/presentation-3";
import React from "react";

const Collection: React.FC = () => {
  const dispatch: any = useViewerDispatch();
  const viewerState: any = useViewerState();

  const { activeManifest, collection, configOptions, vault } = viewerState;
  const maxHeight = configOptions?.canvasHeight;

  const handleValueChange = (manifestId: string) => {
    dispatch({
      type: "updateActiveManifest",
      manifestId: manifestId,
    });
  };

  return (
    <div style={{ margin: "0.75rem" }}>
      <Select
        label={collection.label}
        maxHeight={maxHeight}
        value={activeManifest}
        onValueChange={handleValueChange}
      >
        {collection?.items?.map((item: CollectionItems) => (
          <SelectOption
            value={item.id}
            key={item.id}
            thumbnail={vault.get(item?.thumbnail)}
            label={item.label}
          />
        ))}
      </Select>
    </div>
  );
};

export default Collection;
