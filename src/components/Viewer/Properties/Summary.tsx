import { InternationalString } from "@iiif/presentation-3";
import React from "react";
import { Summary } from "src/components/Primitives";

interface PropertiesSummaryProps {
  summary: InternationalString | null;
  parent?: "manifest" | "canvas";
  lang?: string;
}

const PropertiesSummary: React.FC<PropertiesSummaryProps> = ({
  summary,
  parent = "manifest",
  lang,
}) => {
  if (!summary) return <></>;

  return (
    <>
      <Summary summary={summary} as="p" id={`iiif-${parent}-summary`} lang={lang} />
    </>
  );
};

export default PropertiesSummary;
