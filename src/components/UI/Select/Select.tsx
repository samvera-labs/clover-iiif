import * as SelectPrimitive from "@radix-ui/react-select";
import type { SelectProps as RadixSelectProps } from "@radix-ui/react-select";
import React, { ReactNode } from "react";
import {
  selectContent,
  selectLabel,
  selectRoot,
  selectTrigger,
} from "src/components/UI/Select/Select.css";

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
  ...rest
}) => {
  return (
    <SelectPrimitive.Root
      onValueChange={onValueChange}
      value={value}
      {...rest}
    >
      <div className={selectRoot}>
        <SelectPrimitive.Trigger
          className={selectTrigger}
          data-testid="select-button"
        >
          <SelectPrimitive.Value data-testid="select-button-value" />
          <SelectPrimitive.Icon>
            <Icon direction="down" title="select" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={selectContent}
            data-testid="select-content"
            style={{ maxHeight }}
          >
            <SelectPrimitive.ScrollUpButton>
              <Icon direction="up" title="scroll up for more" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Group>
                {label && (
                  <SelectPrimitive.Label className={selectLabel}>
                    <Label data-testid="select-label" label={label} />
                  </SelectPrimitive.Label>
                )}
                {children}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton>
              <Icon direction="down" title="scroll down for more" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </div>
    </SelectPrimitive.Root>
  );
};

export default Select;
