import { InternationalString } from "@iiif/presentation-3";
import React from "react";
import { Summary } from "src/components/Primitives";
import { Text } from "@radix-ui/themes";

interface PropertiesSummaryProps {
  summary: InternationalString | null;
  parent?: "manifest" | "canvas";
}

const PropertiesSummary: React.FC<PropertiesSummaryProps> = ({
  summary,
  parent = "manifest",
}) => {
  if (!summary) return <></>;

  return (
    <>
      <Summary summary={summary} as={Text} id={`iiif-${parent}-summary`} />
    </>
  );
};

export default PropertiesSummary;
