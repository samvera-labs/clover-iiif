import {
  SelectProps as RadixSelectProps,
  SelectGroup,
  SelectIcon,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectValue,
  SelectViewport,
} from "@radix-ui/react-select";
import React, { ReactNode } from "react";
import {
  StyledSelect,
  StyledSelectButton,
  StyledSelectContent,
  StyledSelectLabel,
} from "src/components/UI/Select/Select.styled";

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
    <StyledSelect onValueChange={onValueChange} value={value}>
      <StyledSelectButton data-testid="select-button">
        <SelectValue data-testid="select-button-value" />
        <SelectIcon>
          <Icon direction="down" title="select" />
        </SelectIcon>
      </StyledSelectButton>
      <SelectPortal>
        <StyledSelectContent
          css={{ maxHeight: `${maxHeight} !important` }}
          data-testid="select-content"
        >
          <SelectScrollUpButton>
            <Icon direction="up" title="scroll up for more" />
          </SelectScrollUpButton>
          <SelectViewport>
            <SelectGroup>
              {label && (
                <StyledSelectLabel>
                  <Label data-testid="select-label" label={label} />
                </StyledSelectLabel>
              )}
              {children}
            </SelectGroup>
          </SelectViewport>
          <SelectScrollDownButton>
            <Icon direction="down" title="scroll down for more" />
          </SelectScrollDownButton>
        </StyledSelectContent>
      </SelectPortal>
    </StyledSelect>
  );
};

export default Select;
