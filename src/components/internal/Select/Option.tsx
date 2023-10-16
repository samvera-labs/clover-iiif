import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";
import { Label, Thumbnail } from "src/components/Primitives";
import {
  SelectItemIndicator,
  SelectItemProps,
  SelectItemText,
} from "@radix-ui/react-select";

import React from "react";
import { StyledSelectItem } from "./Select.styled";

export interface SelectOptionProps extends SelectItemProps {
  label: InternationalString;
  thumbnail?: IIIFExternalWebResource[];
}

const SelectOption = (props) => (
  <StyledSelectItem {...props}>
    {props.thumbnail && <Thumbnail thumbnail={props.thumbnail} />}
    <SelectItemText>
      <Label label={props.label} />
    </SelectItemText>
    <SelectItemIndicator />
  </StyledSelectItem>
);

export default SelectOption;
