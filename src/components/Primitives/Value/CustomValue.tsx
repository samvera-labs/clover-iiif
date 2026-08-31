import React, { Fragment, cloneElement } from "react";

import { PrimitivesCustomValue } from "src/types/primitives";
import { getLabelEntries } from "src/lib/label-helpers";
import { usePrimitivesContext } from "src/context/primitives-context";

const CustomValue: React.FC<PrimitivesCustomValue> = ({
  as: Tag = "dd",
  customValueContent,
  lang,
  value,
}) => {
  const { delimiter } = usePrimitivesContext();

  const entries = getLabelEntries(value, lang)?.map((entry) => {
    return cloneElement(customValueContent, {
      value: entry,
    });
  });

  return (
    <Tag lang={lang}>
      {entries?.map((entry, index) => [
        index > 0 && `${delimiter}`,
        <Fragment key={index}>{entry}</Fragment>,
      ])}
    </Tag>
  );
};

export default CustomValue;
