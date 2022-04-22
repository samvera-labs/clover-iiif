import React, { useCallback, useEffect, useState } from "react";
import OpenSeadragon, { Viewer } from "openseadragon";
import { ImageService, Service } from "@iiif/presentation-3";
import { Navigator, Viewport, Wrapper } from "./ImageViewer.styled";
import Controls from "./Controls";
import { getInfoResponse } from "services/iiif";
import { v4 as uuid } from "uuid";

interface ImageViewerProps {
  service: Service[] | undefined;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ service }) => {
  const [imageService, setImageService] = useState<ImageService>();
  const instance = uuid();

  /**
   * Set IIIF image service from given content resource
   */
  useEffect(() => {
    if (Array.isArray(service))
      setImageService(service[0] as any as ImageService);
  }, [service]);

  /**
   * Loads tileSource of current canvas from IIIF image service
   */
  useEffect(() => {
    if (imageService) {
      let id: string | undefined;
      "@id" in imageService
        ? (id = imageService["@id"])
        : (id = imageService.id);

      if (id)
        getInfoResponse(id).then((tileSource) =>
          OpenSeadragon({
            id: `openseadragon-viewport-${instance}`,
            loadTilesWithAjax: true,
            homeButton: "zoomReset",
            showFullPageControl: false,
            zoomInButton: "zoomIn",
            zoomOutButton: "zoomOut",
            showNavigator: true,
            navigatorBorderColor: "transparent",
            navigatorId: `openseadragon-navigator-${instance}`,
          })?.open(tileSource),
        );
    }
  }, [imageService]);

  return (
    <Wrapper data-testid="image-viewer">
      <Controls />
      <Navigator id={`openseadragon-navigator-${instance}`} />
      <Viewport id={`openseadragon-viewport-${instance}`} />
    </Wrapper>
  );
};

export default ImageViewer;
