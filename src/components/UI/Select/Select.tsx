import {
  Select as RadixSelect,
  SelectProps as RadixSelectProps,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectIcon,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@radix-ui/react-select";
import React, { ReactNode } from "react";
import Icon from "./Icon";
import { InternationalString } from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";

interface SelectProps extends RadixSelectProps {
  children?: ReactNode[] | ReactNode;
  label?: InternationalString;
  maxHeight: string;
}

/**
 * generic select component
 */
const Select: React.FC<SelectProps> = ({
  children,
  label,
  maxHeight,
  onValueChange,
  value,
}) => {
  return (
    <RadixSelect onValueChange={onValueChange} value={value}>
      <SelectTrigger
        className="clover-select-button"
        data-testid="select-button"
      >
        <SelectValue data-testid="select-button-value" />
        <SelectIcon>
          <Icon direction="down" title="select" />
        </SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          className="clover-select-content"
          data-testid="select-content"
          position="popper"
          sideOffset={4}
          style={
            { "--clover-select-max-height": maxHeight } as React.CSSProperties
          }
        >
          <SelectScrollUpButton>
            <Icon direction="up" title="scroll up for more" />
          </SelectScrollUpButton>
          <SelectViewport>
            <SelectGroup>
              {label && (
                <SelectLabel className="clover-select-label">
                  <Label data-testid="select-label" label={label} />
                </SelectLabel>
              )}
              {children}
            </SelectGroup>
          </SelectViewport>
          <SelectScrollDownButton>
            <Icon direction="down" title="scroll down for more" />
          </SelectScrollDownButton>
        </SelectContent>
      </SelectPortal>
    </RadixSelect>
  );
};

export default Select;
