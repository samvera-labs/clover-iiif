import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesSeeAlso } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const SeeAlso: React.FC<PrimitivesSeeAlso> = (props) => {
  const { as, seeAlso } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "seeAlso"];
  const linkAttributes = sanitizeAttributes(props, remove);
  const List = (as ?? "ul") as React.ElementType;

  return (
    <List>
      {seeAlso?.map((resource) => {
        const label = getLabelAsString(
          resource.label,
          linkAttributes.lang,
        ) as string;
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

export default SeeAlso;
