import React from "react";
import {
  PrimitivesExternalWebResource,
  PrimitivesThumbnail,
} from "src/types/primitives";
import { sanitizeAttributes } from "src/lib/html-element";
import ContentResource from "src/components/Primitives/ContentResource/ContentResource";

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
