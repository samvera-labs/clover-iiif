import OSD, { osdImageTypes } from "src/components/Viewer/ImageViewer/OSD";
import React, { useEffect, useState } from "react";

import { AnnotationResources } from "src/types/annotations";
import { LabeledIIIFExternalWebResource } from "src/types/presentation-3";
import { getImageServiceURI } from "src/lib/iiif";

interface ImageViewerProps {
  painting: LabeledIIIFExternalWebResource;
  hasPlaceholder: boolean;
  annotationResources: AnnotationResources;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  painting,
  hasPlaceholder,
  annotationResources,
}) => {
  const [imageType, setImageType] = useState<osdImageTypes>();
  const [uri, setUri] = useState<string | undefined>();

  useEffect(() => {
    if (Array.isArray(painting?.service) && painting?.service.length > 0) {
      setImageType("tiledImage");
      setUri(getImageServiceURI(painting?.service));
    } else {
      setImageType("simpleImage");
      setUri(painting?.id);
    }
  }, [painting]);

  return (
    <OSD
      uri={uri}
      key={uri}
      hasPlaceholder={hasPlaceholder}
      imageType={imageType}
      annotationResources={annotationResources}
    />
  );
};

export default ImageViewer;
