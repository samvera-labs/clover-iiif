import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesPartOf } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const PartOf: React.FC<PrimitivesPartOf> = (props) => {
  const { as: Wrapper = "ul", partOf } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "partOf"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <Wrapper>
      {partOf &&
        partOf.map((resource) => {
          const label = resource.label
            ? (getLabelAsString(resource.label, attributes.lang) as string)
            : undefined;
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

export default PartOf;
