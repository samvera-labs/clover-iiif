import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesHomepage } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

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
            <a
              aria-label={children ? label : undefined}
              href={resource.id}
              key={resource.id}
              {...attributes}
            >
              {children ? children : label}
            </a>
          );
        })}
    </>
  );
};

export default Homepage;
