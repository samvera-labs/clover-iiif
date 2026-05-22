import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

import React from "react";
import { Thumbnail } from "src/components/Primitives";

interface PropertiesThumbnailProps {
  label: InternationalString | null;
  thumbnail: IIIFExternalWebResource[];
  objectFit?: "cover" | "contain";
}

const PropertiesThumbnail: React.FC<PropertiesThumbnailProps> = ({
  label,
  thumbnail,
  objectFit = "cover",
}) => {
  if (thumbnail?.length === 0) return <></>;

  return (
    <>
      <Thumbnail
        altAsLabel={label ? label : { none: ["resource"] }}
        thumbnail={thumbnail}
        style={{ backgroundColor: "#6663", objectFit: objectFit }}
      />
    </>
  );
};

export default PropertiesThumbnail;
