import {
  PrimitivesContext,
  PrimitivesProvider,
  usePrimitivesContext,
} from "src/context/primitives-context";
import { createMarkup, sanitizeAttributes } from "src/lib/html-element";

import { PrimitivesMarkup } from "src/types/primitives";
import React from "react";
import { getLabelEntries } from "src/lib/label-helpers";
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

  const entries = getLabelEntries(markup, attributes.lang as string);

  const MarkupEntry = ({ value }: { value: string }) => {
    const html = createMarkup(value);

    return (
      <StyledMarkup as={as} {...attributes} dangerouslySetInnerHTML={html} />
    );
  };

  return (
    <>
      {entries?.map((entry) => (
        <MarkupEntry value={entry} />
      ))}
    </>
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
