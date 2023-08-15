import {
  IIIFExternalWebResource,
  InternationalString,
} from "@iiif/presentation-3";

import React from "react";
import { Thumbnail } from "src/components/Primitives";

interface PropertiesThumbnailProps {
  label: InternationalString | null;
  thumbnail: IIIFExternalWebResource[];
}

const PropertiesThumbnail: React.FC<PropertiesThumbnailProps> = ({
  label,
  thumbnail,
}) => {
  if (thumbnail?.length === 0) return <></>;

  return (
    <>
      <Thumbnail
        altAsLabel={label ? label : { none: ["resource"] }}
        thumbnail={thumbnail}
      />
    </>
  );
};

export default PropertiesThumbnail;
