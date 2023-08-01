import React, { cloneElement, Fragment } from "react";
import { PrimitivesCustomValue } from "src/types/primitives";
import { styled } from "src/styles/stitches.config";
import { getLabelEntries } from "src/lib/label-helpers";

const StyledCustomValue = styled("span", {});

const CustomValue: React.FC<PrimitivesCustomValue> = ({
  as = "dd",
  customValueContent,
  lang,
  value,
}) => {
  const entries = getLabelEntries(value, lang)?.map((entry) => {
    return cloneElement(customValueContent, {
      value: entry,
    });
  });

  return (
    <StyledCustomValue as={as} lang={lang}>
      {entries?.map((entry, index) => [
        index > 0,
        <Fragment key={index}>{entry}</Fragment>,
      ])}
    </StyledCustomValue>
  );
};

export default CustomValue;
