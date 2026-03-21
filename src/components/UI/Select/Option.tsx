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
import { selectItem } from "./Select.css";

export interface SelectOptionProps extends SelectItemProps {
  label: InternationalString;
  thumbnail?: IIIFExternalWebResource[];
}

const SelectOption: React.FC<SelectOptionProps> = ({
  className,
  label,
  thumbnail,
  ...props
}) => (
  <SelectItem
    {...props}
    className={[selectItem, className].filter(Boolean).join(" ")}
  >
    {thumbnail && <Thumbnail thumbnail={thumbnail} />}
    <SelectItemText>
      <Label label={label} />
    </SelectItemText>
    <SelectItemIndicator />
  </SelectItem>
);

export default SelectOption;
