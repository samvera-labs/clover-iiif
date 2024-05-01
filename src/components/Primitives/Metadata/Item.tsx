import CustomValue from "../Value/CustomValue";
import { DataList } from "@radix-ui/themes";
import Label from "../Label/Label";
import { PrimitivesMetadataItem } from "src/types/primitives";
import React from "react";
import Value from "../Value/Value";
import { getLabelAsString } from "src/lib/label-helpers";

const MetadataItem: React.FC<PrimitivesMetadataItem> = (props) => {
  const { item, lang, customValueContent } = props;
  const { label, value } = item;

  /**
   * Create value for data-label attribute for use as a selector
   */
  const dataAttribute = getLabelAsString(label)
    ?.replace(" ", "-")
    .toLowerCase();

  return (
    <DataList.Item role="group" data-label={dataAttribute}>
      <Label as={DataList.Label} label={label} lang={lang} />
      {customValueContent ? (
        <CustomValue
          as={DataList.Value}
          customValueContent={customValueContent}
          value={value}
          lang={lang}
        />
      ) : (
        <Value as="dd" value={value} lang={lang} />
      )}
    </DataList.Item>
  );
};

export default MetadataItem;
