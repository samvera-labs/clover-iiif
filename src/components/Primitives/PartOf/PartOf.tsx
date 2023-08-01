import React from "react";
import { styled } from "src/styles/stitches.config";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesPartOf } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const StyledPartOf = styled("li", {});
const StyledWrapper = styled("ul", {});

const PartOf: React.FC<PrimitivesPartOf> = (props) => {
  const { as, partOf } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "partOf"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <StyledWrapper as={as}>
      {partOf &&
        partOf.map((resource) => {
          const label = resource.label
            ? (getLabelAsString(resource.label, attributes.lang) as string)
            : undefined;
          return (
            <StyledPartOf key={resource.id}>
              <a href={resource.id} {...attributes}>
                {label ? label : resource.id}
              </a>
            </StyledPartOf>
          );
        })}
    </StyledWrapper>
  );
};

export default PartOf;
