import React, { useEffect, useState } from "react";
import { IIIFExternalWebResource } from "@iiif/presentation-3";
import OSD, { osdImageTypes } from "src/components/Viewer/ImageViewer/OSD";
import { getImageServiceURI } from "src/lib/iiif";

interface ImageViewerProps {
  body: IIIFExternalWebResource;
  hasPlaceholder: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ body, hasPlaceholder }) => {
  const [imageType, setImageType] = useState<osdImageTypes>();
  const [uri, setUri] = useState<string | undefined>();

  useEffect(() => {
    if (Array.isArray(body.service) && body.service.length > 0) {
      setImageType("tiledImage");
      setUri(getImageServiceURI(body.service));
    } else {
      setImageType("simpleImage");
      setUri(body.id);
    }
  }, [body]);

  return (
    <OSD
      uri={uri}
      key={uri}
      imageType={imageType}
      hasPlaceholder={hasPlaceholder}
    />
  );
};

export default ImageViewer;
