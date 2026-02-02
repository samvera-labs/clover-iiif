import { MetadataItem } from "@iiif/presentation-3";
import React from "react";
import { Metadata } from "src/components/Primitives";

interface PropertiesMetadataProps {
  metadata: MetadataItem[] | null;
  parent?: "manifest" | "canvas";
  lang?: string;
}

const PropertiesMetadata: React.FC<PropertiesMetadataProps> = ({
  metadata,
  parent = "manifest",
  lang,
}) => {
  if (!metadata) return <></>;

  return (
    <>
      <Metadata metadata={metadata} id={`iiif-${parent}-metadata`} lang={lang} />
    </>
  );
};

export default PropertiesMetadata;
