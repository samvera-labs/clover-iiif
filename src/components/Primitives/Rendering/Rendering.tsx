import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesRendering } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const Rendering: React.FC<PrimitivesRendering> = (props) => {
  const { as, rendering } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "rendering"];
  const linkAttributes = sanitizeAttributes(props, remove);
  const List = (as ?? "ul") as React.ElementType;

  return (
    <List>
      {rendering?.map((resource) => {
        const label = getLabelAsString(
          resource.label,
          linkAttributes.lang,
        ) as string;
        return (
          <li key={resource.id}>
            <a href={resource.id} {...linkAttributes} target="_blank">
              {label ? label : resource.id}
            </a>
          </li>
        );
      })}
    </List>
  );
};

export default Rendering;
