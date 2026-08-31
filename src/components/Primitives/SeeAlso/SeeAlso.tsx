import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesSeeAlso } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const SeeAlso: React.FC<PrimitivesSeeAlso> = (props) => {
  const { as: Wrapper = "ul", seeAlso } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "seeAlso"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <Wrapper>
      {seeAlso &&
        seeAlso.map((resource) => {
          const label = getLabelAsString(
            resource.label,
            attributes.lang,
          ) as string;
          return (
            <li key={resource.id}>
              <a href={resource.id} {...attributes}>
                {label ? label : resource.id}
              </a>
            </li>
          );
        })}
    </Wrapper>
  );
};

export default SeeAlso;
