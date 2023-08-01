import React from "react";
import { styled } from "src/styles/stitches.config";
import { getLabelAsString } from "src/lib/label-helpers";
import { PrimitivesMarkup } from "src/types/primitives";
import { createMarkup, sanitizeAttributes } from "src/lib/html-element";

const StyledMarkup = styled("span", {});

const Markup: React.FC<PrimitivesMarkup> = (props) => {
  const { as, markup } = props;

  if (!markup) return <></>;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "markup"];
  let attributes = sanitizeAttributes(props, remove);

  const html = createMarkup(
    getLabelAsString(markup, attributes.lang as string, ", ") as string
  );

  return (
    <StyledMarkup as={as} {...attributes} dangerouslySetInnerHTML={html} />
  );
};

const MarkupWrapper: React.FC<PrimitivesMarkup> = (props) => {
  return <Markup {...props} />;
};

export default MarkupWrapper;
