import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";
import { Label, Thumbnail } from "src/components/Primitives";
import {
  SelectItem,
  SelectItemIndicator,
  SelectItemProps,
  SelectItemText,
} from "@radix-ui/react-select";

import React from "react";

export interface SelectOptionProps extends SelectItemProps {
  label: InternationalString;
  thumbnail?: IIIFExternalWebResource[];
}

const SelectOption = (props) => (
  <SelectItem {...props} className="clover-select-item">
    {props.thumbnail && <Thumbnail thumbnail={props.thumbnail} />}
    <SelectItemText>
      <Label label={props.label} />
    </SelectItemText>
    <SelectItemIndicator />
  </SelectItem>
);

export default SelectOption;
