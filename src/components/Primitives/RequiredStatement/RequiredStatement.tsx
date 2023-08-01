import React from "react";
import { styled } from "src/styles/stitches.config";
import MetadataItem from "src/components/Primitives/Metadata/Item";
import { PrimitivesRequiredStatement } from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";

const StyledRequiredStatement = styled("dl", {});

const RequiredStatement: React.FC<PrimitivesRequiredStatement> = (props) => {
  const { as, requiredStatement } = props;

  if (!requiredStatement) return <></>;

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "customValueDelimiter", "requiredStatement"];
  let attributes = sanitizeAttributes(props, remove);

  return (
    <StyledRequiredStatement as={as} {...attributes}>
      <MetadataItem item={requiredStatement} lang={attributes.lang} />
    </StyledRequiredStatement>
  );
};

export default RequiredStatement;
