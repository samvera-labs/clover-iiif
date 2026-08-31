import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesRendering } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const Rendering: React.FC<PrimitivesRendering> = (props) => {
  const { as: Wrapper = "ul", rendering } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "rendering"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <Wrapper>
      {rendering &&
        rendering.map((resource) => {
          const label = getLabelAsString(
            resource.label,
            attributes.lang,
          ) as string;
          return (
            <li key={resource.id}>
              <a href={resource.id} {...attributes} target="_blank">
                {label ? label : resource.id}
              </a>
            </li>
          );
        })}
    </Wrapper>
  );
};

export default Rendering;
