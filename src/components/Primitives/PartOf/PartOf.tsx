import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesPartOf } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const PartOf: React.FC<PrimitivesPartOf> = (props) => {
  const { as, partOf } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "partOf"];
  const linkAttributes = sanitizeAttributes(props, remove);
  const List = (as ?? "ul") as React.ElementType;

  return (
    <List>
      {partOf?.map((resource) => {
        const label = resource.label
          ? (getLabelAsString(resource.label, linkAttributes.lang) as string)
          : undefined;
        return (
          <li key={resource.id}>
            <a href={resource.id} {...linkAttributes}>
              {label ? label : resource.id}
            </a>
          </li>
        );
      })}
    </List>
  );
};

export default PartOf;
