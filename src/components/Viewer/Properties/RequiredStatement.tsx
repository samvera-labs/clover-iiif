import { MetadataItem } from "@iiif/presentation-3";
import React from "react";
import { RequiredStatement } from "src/components/Primitives";

interface PropertiesSummaryProps {
  requiredStatement: MetadataItem | null;
  parent?: "manifest" | "canvas";
}

const PropertiesRequiredStatement: React.FC<PropertiesSummaryProps> = ({
  requiredStatement,
  parent = "manifest",
}) => {
  if (!requiredStatement) return <></>;

  return (
    <>
      <RequiredStatement
        requiredStatement={requiredStatement}
        id={`iiif-${parent}-required-statement`}
        orientation="vertical"
        size="3"
      />
    </>
  );
};

export default PropertiesRequiredStatement;
