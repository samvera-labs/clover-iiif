import { MetadataItem } from "@iiif/presentation-3";
import React from "react";
import { Metadata } from "src/components/Primitives";

interface PropertiesMetadataProps {
  metadata: MetadataItem[] | null;
  parent?: "manifest" | "canvas";
}

const PropertiesMetadata: React.FC<PropertiesMetadataProps> = ({
  metadata,
  parent = "manifest",
}) => {
  if (!metadata) return <></>;

  return (
    <>
      <Metadata metadata={metadata} id={`iiif-${parent}-metadata`} />
    </>
  );
};

export default PropertiesMetadata;
