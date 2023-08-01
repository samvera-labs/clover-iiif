import React, { Fragment, cloneElement } from "react";

import { PrimitivesCustomValue } from "src/types/primitives";
import { getLabelEntries } from "src/lib/label-helpers";
import { styled } from "src/styles/stitches.config";
import { usePrimitivesContext } from "src/context/primitives-context";

const StyledCustomValue = styled("span", {});

const CustomValue: React.FC<PrimitivesCustomValue> = ({
  as = "dd",
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
    <StyledCustomValue as={as} lang={lang}>
      {entries?.map((entry, index) => [
        index > 0 && `${delimiter}`,
        <Fragment key={index}>{entry}</Fragment>,
      ])}
    </StyledCustomValue>
  );
};

export default CustomValue;
