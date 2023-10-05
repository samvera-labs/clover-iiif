import {
  Navigator,
  Viewport,
  Wrapper,
} from "src/components/Viewer/ImageViewer/ImageViewer.styled";
import OpenSeadragon, { Options } from "openseadragon";
import React, { useEffect, useState } from "react";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";

import Controls from "src/components/Viewer/ImageViewer/Controls";
import { getInfoResponse } from "src/lib/iiif";
import { v4 as uuidv4 } from "uuid";

export type osdImageTypes = "tiledImage" | "simpleImage" | undefined;

interface OSDProps {
  uri: string | undefined;
  imageType: osdImageTypes;
  hasPlaceholder: boolean;
}

const OSD: React.FC<OSDProps> = ({ uri, imageType, hasPlaceholder }) => {
  const [osdUri, setOsdUri] = useState<string>();
  const viewerState: ViewerContextStore = useViewerState();
  const { configOptions } = viewerState;

  const instance = uuidv4();

  const config: Options = {
    id: `openseadragon-viewport-${instance}`,
    loadTilesWithAjax: true,
    fullPageButton: "fullPage",
    homeButton: "reset",
    rotateLeftButton: "rotateLeft",
    rotateRightButton: "rotateRight",
    zoomInButton: "zoomIn",
    zoomOutButton: "zoomOut",
    showNavigator: true,
    showFullPageControl: true,
    showHomeControl: true,
    showRotationControl: true,
    showZoomControl: true,
    navigatorBorderColor: "transparent",
    navigatorId: `openseadragon-navigator-${instance}`,
    gestureSettingsMouse: {
      clickToZoom: true,
      dblClickToZoom: true,
      pinchToZoom: true,
      scrollToZoom: true,
    },
    ...configOptions.openSeadragon,
    ajaxWithCredentials: configOptions.withCredentials,
  };

  useEffect(() => {
    if (uri !== osdUri) setOsdUri(uri);
  }, [osdUri, uri]);

  useEffect(() => {
    if (osdUri) {
      switch (imageType) {
        case "simpleImage":
          OpenSeadragon(config).addSimpleImage({
            url: osdUri,
          });
          break;
        case "tiledImage":
          getInfoResponse(osdUri).then((tileSource) =>
            OpenSeadragon(config).addTiledImage({
              tileSource: tileSource,
            }),
          );
          break;
        default:
          console.warn(
            `Unable to render ${osdUri} in OpenSeadragon as type: "${imageType}"`,
          );
          break;
      }
    }
  }, [osdUri]);

  return (
    <Wrapper
      css={{
        backgroundColor: configOptions.canvasBackgroundColor,
        height: configOptions.canvasHeight,
      }}
    >
      <Controls options={config} hasPlaceholder={hasPlaceholder} />
      <Navigator id={`openseadragon-navigator-${instance}`} />
      <Viewport id={`openseadragon-viewport-${instance}`} />
    </Wrapper>
  );
};

export default OSD;
