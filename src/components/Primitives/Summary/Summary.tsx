import React from "react";
import { PrimitivesSummary } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";
import Markup from "src/components/Primitives/Markup/Markup";

const Summary: React.FC<PrimitivesSummary> = (props) => {
  const { as, summary } = props;
  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "customValueDelimiter", "summary"];
  let attributes = sanitizeAttributes(props, remove);

  return <Markup as={as} markup={summary} {...attributes} />;
};

export default Summary;
