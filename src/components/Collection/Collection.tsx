import * as Select from "@radix-ui/react-select";
import {
  CollectionButton,
  CollectionContent,
  CollectionItem,
  CollectionLabel,
  CollectionStyled,
} from "@/components/Collection/Collection.styled";
import { Label, Thumbnail } from "@samvera/nectar-iiif";
import { useViewerDispatch, useViewerState } from "@/context/viewer-context";
import React from "react";
import { CollectionItems } from "@iiif/presentation-3";
import Icon from "@/components/Collection/Icon";

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
    <CollectionStyled>
      <Select.Root value={activeManifest} onValueChange={handleValueChange}>
        <CollectionButton>
          <Select.Value />
          <Select.Icon>
            <Icon direction="down" title="select from collection" />
          </Select.Icon>
        </CollectionButton>
        <CollectionContent css={{ maxHeight: `${maxHeight} !important` }}>
          <Select.ScrollUpButton>
            <Icon direction="up" title="scroll up for more" />
          </Select.ScrollUpButton>
          <Select.Viewport>
            <Select.Group>
              <CollectionLabel>
                <Label label={collection.label} />
              </CollectionLabel>
              {collection.items.map((item: CollectionItems) => (
                <CollectionItem value={item.id} key={item.id}>
                  <Thumbnail thumbnail={vault.get(item.thumbnail)} />
                  <Select.ItemText>
                    <Label label={item.label} />
                  </Select.ItemText>
                  <Select.ItemIndicator />
                </CollectionItem>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton>
            <Icon direction="down" title="scroll down for more" />
          </Select.ScrollDownButton>
        </CollectionContent>
      </Select.Root>
    </CollectionStyled>
  );
};

export default Collection;
