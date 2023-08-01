import React from "react";
import { styled } from "src/styles/stitches.config";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesSeeAlso } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const StyledSeeAlso = styled("li", {});
const StyledWrapper = styled("ul", {});

const SeeAlso: React.FC<PrimitivesSeeAlso> = (props) => {
  const { as, seeAlso } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "seeAlso"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <StyledWrapper as={as}>
      {seeAlso &&
        seeAlso.map((resource) => {
          const label = getLabelAsString(
            resource.label,
            attributes.lang
          ) as string;
          return (
            <StyledSeeAlso key={resource.id}>
              <a href={resource.id} {...attributes}>
                {label ? label : resource.id}
              </a>
            </StyledSeeAlso>
          );
        })}
    </StyledWrapper>
  );
};

export default SeeAlso;
