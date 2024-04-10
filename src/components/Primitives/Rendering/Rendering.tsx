import React from "react";
import { styled } from "src/styles/stitches.config";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesRendering } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const StyledRendering = styled("li", {});
const StyledWrapper = styled("ul", {});

const Rendering: React.FC<PrimitivesRendering> = (props) => {
  const { as, rendering } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "rendering"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <StyledWrapper as={as}>
      {rendering &&
        rendering.map((resource) => {
          const label = getLabelAsString(
            resource.label,
            attributes.lang,
          ) as string;
          return (
            <StyledRendering key={resource.id}>
              <a href={resource.id} {...attributes} target="_blank">
                {label ? label : resource.id}
              </a>
            </StyledRendering>
          );
        })}
    </StyledWrapper>
  );
};

export default Rendering;
