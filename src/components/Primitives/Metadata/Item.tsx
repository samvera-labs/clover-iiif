import React from "react";
import Label from "../Label/Label";
import Value from "../Value/Value";
import { PrimitivesMetadataItem } from "src/types/primitives";
import CustomValue from "../Value/CustomValue";
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

  // `dl` accepts a plain `div` wrapper but not a `role="group"` child, which cost the
  // dt/dd pairs their association (WCAG 1.3.1).
  return (
    <div data-label={dataAttribute}>
      <Label as="dt" label={label} lang={lang} />
      {customValueContent ? (
        <CustomValue
          as="dd"
          customValueContent={customValueContent}
          value={value}
          lang={lang}
        />
      ) : (
        <Value as="dd" value={value} lang={lang} />
      )}
    </div>
  );
};

export default MetadataItem;
