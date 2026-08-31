import MetadataItem from "src/components/Primitives/Metadata/Item";
import { PrimitivesProvider } from "src/context/primitives-context";
import { PrimitivesRequiredStatement } from "src/types/primitives";
import React from "react";
import { getRealPropertyValue } from "src/lib/utils";
import { sanitizeAttributes } from "src/lib/html-element";

const RequiredStatement: React.FC<PrimitivesRequiredStatement> = (props) => {
  const { as: Tag = "dl", requiredStatement } = props;

  if (!requiredStatement) return <></>;

  const delimiter = getRealPropertyValue(props, "customValueDelimiter");

  /**
   * Create attributes and remove React props
   */
  const remove = ["as", "customValueDelimiter", "requiredStatement"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <PrimitivesProvider
      {...(typeof delimiter === "string"
        ? { initialState: { delimiter: delimiter as string } }
        : undefined)}
    >
      <Tag {...attributes}>
        <MetadataItem item={requiredStatement} lang={attributes.lang} />
      </Tag>
    </PrimitivesProvider>
  );
};

export default RequiredStatement;
