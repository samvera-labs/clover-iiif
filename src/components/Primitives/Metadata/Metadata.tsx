import MetadataItem from "src/components/Primitives/Metadata/Item";
import { PrimitivesMetadata } from "src/types/primitives";
import { PrimitivesProvider } from "src/context/primitives-context";
import React from "react";
import { getRealPropertyValue } from "src/lib/utils";
import { parseCustomContent } from "src/lib/custom";
import { sanitizeAttributes } from "src/lib/html-element";
import { styled } from "src/styles/stitches.config";

const StyledMetadata = styled("dl", {});

const Metadata: React.FC<PrimitivesMetadata> = (props) => {
  const { as, customValueContent, metadata } = props;

  if (!Array.isArray(metadata)) return <></>;

  const delimiter = getRealPropertyValue(props, "customValueDelimiter");

  /**
   * Create attributes and remove React props
   */
  const remove = [
    "as",
    "customValueContent",
    "customValueDelimiter",
    "metadata",
  ];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <PrimitivesProvider
      {...(typeof delimiter === "string"
        ? { initialState: { delimiter: delimiter as string } }
        : undefined)}
    >
      {metadata.length > 0 && (
        <StyledMetadata as={as} {...attributes}>
          {metadata.map((item, index) => {
            const customValue = customValueContent
              ? parseCustomContent(item.label, customValueContent)
              : undefined;

            return (
              <MetadataItem
                customValueContent={customValue}
                item={item}
                key={index}
                lang={attributes?.lang}
              />
            );
          })}
        </StyledMetadata>
      )}
    </PrimitivesProvider>
  );
};

export default Metadata;
