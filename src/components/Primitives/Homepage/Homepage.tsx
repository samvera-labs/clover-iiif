import React from "react";
import { styled } from "src/styles/stitches.config";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesHomepage } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const StyledHomepage = styled("a", {});

const Homepage: React.FC<PrimitivesHomepage> = (props) => {
  const { children, homepage } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["children", "homepage"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <>
      {homepage &&
        homepage.map((resource) => {
          const label = getLabelAsString(
            resource.label,
            attributes.lang,
          ) as string;
          return (
            <StyledHomepage
              aria-label={children ? label : undefined}
              href={resource.id}
              key={resource.id}
              {...attributes}
            >
              {children ? children : label}
            </StyledHomepage>
          );
        })}
    </>
  );
};

export default Homepage;
