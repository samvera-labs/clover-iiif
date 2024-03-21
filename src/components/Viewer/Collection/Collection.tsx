import { Select, SelectOption } from "src/components/UI/Select";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";

import { CollectionItems } from "@iiif/presentation-3";
import React from "react";
import { v4 as uuidv4 } from "uuid";

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
    dispatch({
      type: "updateViewerId",
      viewerId: uuidv4(),
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
            thumbnail={item?.thumbnail ? vault.get(item?.thumbnail) : undefined}
            label={item.label}
          />
        ))}
      </Select>
    </div>
  );
};

export default Collection;
