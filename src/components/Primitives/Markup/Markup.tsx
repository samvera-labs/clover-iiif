import {
  PrimitivesContext,
  PrimitivesProvider,
  usePrimitivesContext,
} from "src/context/primitives-context";
import { createMarkup, sanitizeAttributes } from "src/lib/html-element";

import { PrimitivesMarkup } from "src/types/primitives";
import React from "react";
import { getLabelAsString } from "src/lib/label-helpers";
import { styled } from "src/styles/stitches.config";

const StyledMarkup = styled("span", {});

const Markup: React.FC<PrimitivesMarkup> = (props) => {
  const { as, markup } = props;
  const { delimiter } = usePrimitivesContext();

  if (!markup) return <></>;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "markup"];
  let attributes = sanitizeAttributes(props, remove);

  const html = createMarkup(
    getLabelAsString(markup, attributes.lang as string, delimiter) as string
  );

  return (
    <StyledMarkup as={as} {...attributes} dangerouslySetInnerHTML={html} />
  );
};

const MarkupWrapper: React.FC<PrimitivesMarkup> = (props) => {
  const context = React.useContext(PrimitivesContext);

  return context ? (
    <Markup {...props} />
  ) : (
    <PrimitivesProvider>
      <Markup {...props} />
    </PrimitivesProvider>
  );
};

export default MarkupWrapper;
