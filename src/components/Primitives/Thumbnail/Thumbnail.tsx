import {
  PrimitivesExternalWebResource,
  PrimitivesThumbnail,
} from "src/types/primitives";

import ContentResource from "src/components/Primitives/ContentResource/ContentResource";
import React from "react";
import { sanitizeAttributes } from "src/lib/html-element";

const Thumbnail: React.FC<PrimitivesThumbnail> = (props) => {
  const { thumbnail, region } = props;

  /**
   * Create attributes and remove React props
   */
  const remove = ["thumbnail"];
  const attributes = sanitizeAttributes(props, remove);

  return (
    <>
      {thumbnail &&
        thumbnail.map((contentResource) => (
          <ContentResource
            contentResource={contentResource as PrimitivesExternalWebResource}
            key={contentResource.id}
            region={region}
            {...attributes}
          />
        ))}
    </>
  );
};

export default Thumbnail;
