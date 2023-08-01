import React from "react";
import { styled } from "src/styles/stitches.config";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesLabel } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const StyledLabel = styled("span", {});

const Label: React.FC<PrimitivesLabel> = (props) => {
  const { as, label } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "label"];
  let attributes = sanitizeAttributes(props, remove);

  return (
    <StyledLabel as={as} {...attributes}>
      {getLabelAsString(label, attributes.lang as string) as string}
    </StyledLabel>
  );
};

export default Label;
