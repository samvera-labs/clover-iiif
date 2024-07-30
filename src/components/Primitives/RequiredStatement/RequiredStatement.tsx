import { DataList } from "@radix-ui/themes";
import MetadataItem from "src/components/Primitives/Metadata/Item";
import { PrimitivesProvider } from "src/context/primitives-context";
import { PrimitivesRequiredStatement } from "src/types/primitives";
import React from "react";
import { getRealPropertyValue } from "src/lib/utils";
import { sanitizeAttributes } from "src/lib/html-element";
import { styled } from "src/styles/stitches.config";

const StyledRequiredStatement = styled(DataList.Root, {});

const RequiredStatement: React.FC<PrimitivesRequiredStatement> = (props) => {
  const { as, requiredStatement } = props;

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
      <StyledRequiredStatement orientation="vertical" {...attributes}>
        <MetadataItem item={requiredStatement} lang={attributes.lang} />
      </StyledRequiredStatement>
    </PrimitivesProvider>
  );
};

export default RequiredStatement;
