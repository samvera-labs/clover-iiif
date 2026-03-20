import { PrimitivesLabel } from "src/types/primitives";
import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { sanitizeAttributes } from "src/lib/html-element";

const Label: React.FC<PrimitivesLabel> = (props) => {
  const { as, label } = props;
  const remove = ["as", "label"];
  const attributes = sanitizeAttributes(props, remove);
  const Component = (as ?? "span") as React.ElementType;

  return (
    <Component {...attributes}>
      {getLabelAsString(label, attributes.lang as string) as string}
    </Component>
  );
};

export default Label;
