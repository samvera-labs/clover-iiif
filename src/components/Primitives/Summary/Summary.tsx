import Markup from "src/components/Primitives/Markup/Markup";
import { PrimitivesSummary } from "src/types/primitives";
import React from "react";
import { sanitizeAttributes } from "src/lib/html-element";

const Summary: React.FC<PrimitivesSummary> = (props) => {
  const { as, summary } = props;
  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "customValueDelimiter", "summary"];
  const attributes = sanitizeAttributes(props, remove);

  return <Markup as={as} markup={summary} {...attributes} />;
};

export default Summary;
