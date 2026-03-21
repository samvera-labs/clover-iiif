import React, { Fragment, cloneElement } from "react";

import { PrimitivesCustomValue } from "src/types/primitives";
import { getLabelEntries } from "src/lib/label-helpers";
import { usePrimitivesContext } from "src/context/primitives-context";

const CustomValue: React.FC<PrimitivesCustomValue> = ({
  as = "dd",
  customValueContent,
  lang,
  value,
  ...rest
}) => {
  const { delimiter } = usePrimitivesContext();

  const entries = getLabelEntries(value, lang)?.map((entry) => {
    return cloneElement(customValueContent, {
      value: entry,
    });
  });

  const Component = (as ?? "dd") as React.ElementType;

  return (
    <Component lang={lang} {...rest}>
      {entries?.map((entry, index) => [
        index > 0 && `${delimiter}`,
        <Fragment key={index}>{entry}</Fragment>,
      ])}
    </Component>
  );
};

export default CustomValue;
