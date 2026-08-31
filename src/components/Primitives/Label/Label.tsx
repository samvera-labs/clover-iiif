import { PrimitivesLabel } from "src/types/primitives";
import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { sanitizeAttributes } from "src/lib/html-element";

const Label: React.FC<PrimitivesLabel> = (props) => {
  const { as: Tag = "span", label } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "label"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <Tag {...attributes}>
      {getLabelAsString(label, attributes.lang as string) as string}
    </Tag>
  );
};

export default Label;
