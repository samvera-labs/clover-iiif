import { MetadataItem } from "@iiif/presentation-3";
import React from "react";
import { RequiredStatement } from "src/components/Primitives";

interface PropertiesRequiredStatementProps {
  requiredStatement: MetadataItem | null;
  parent?: "manifest" | "canvas";
  lang?: string;
}

const PropertiesRequiredStatement: React.FC<PropertiesRequiredStatementProps> = ({
  requiredStatement,
  parent = "manifest",
  lang,
}) => {
  if (!requiredStatement) return <></>;

  return (
    <>
      <RequiredStatement
        requiredStatement={requiredStatement}
        id={`iiif-${parent}-required-statement`}
        lang={lang}
      />
    </>
  );
};

export default PropertiesRequiredStatement;
