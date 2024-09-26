import {
  Navigator,
  Viewport,
  Wrapper,
} from "src/components/Image/Image.styled";
import OpenSeadragon, { Options } from "openseadragon";
import React, { useEffect, useRef, useState } from "react";

import Controls from "src/components/Image/Controls/Controls";
import { OpenSeadragonImageTypes } from "src/types/open-seadragon";
import { a } from "vitest/dist/chunks/suite.CcK46U-P";
import { getInfoResponse } from "src/lib/iiif";
import { useViewerDispatch } from "src/context/viewer-context";

interface OSDProps {
  _cloverViewerHasPlaceholder: boolean;
  ariaLabel?: string | null;
  config: Options;
  uri: string | undefined;
  imageType: OpenSeadragonImageTypes;
  openSeadragonCallback?: (viewer: OpenSeadragon.Viewer) => void;
}

const OSD: React.FC<OSDProps> = ({
  ariaLabel,
  config,
  uri,
  _cloverViewerHasPlaceholder,
  imageType,
  openSeadragonCallback,
}) => {
  const [osdUri, setOsdUri] = useState<string>();
  const [openSeadragon, setOpenSeadragon] = useState<OpenSeadragon.Viewer>();
  const dispatch: any = useViewerDispatch();

  const initializeOSD = useRef(false);

  useEffect(() => {
    if (!initializeOSD.current) {
      initializeOSD.current = true;

      if (!openSeadragon) setOpenSeadragon(OpenSeadragon(config));
    }

    return () => openSeadragon?.destroy();
  }, []);

  useEffect(() => {
    if (openSeadragon && openSeadragonCallback)
      openSeadragonCallback(openSeadragon);
  }, [openSeadragon, openSeadragonCallback]);

  useEffect(() => {
    if (openSeadragon && uri !== osdUri) {
      openSeadragon?.forceRedraw();
      setOsdUri(uri);
    }
  }, [openSeadragon, osdUri, uri]);

  useEffect(() => {
    if (osdUri && openSeadragon) {
      switch (imageType) {
        case "simpleImage":
          openSeadragon?.addSimpleImage({
            url: osdUri,
          });
          break;
        case "tiledImage":
          getInfoResponse(osdUri).then((tileSource) => {
            try {
              if (!tileSource)
                throw new Error(`No tile source found for ${osdUri}`);

              openSeadragon?.addTiledImage({
                tileSource,
                success: () => {
                  // NOTE: need to check dispatch is a function, because when
                  // using dev server, dispatch sometimes is set to
                  // ViewerContext.defaultState object instead of a function
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });
            } catch (e) {
              console.error(e);
            }
          });
          break;
        default:
          openSeadragon?.close();
          console.warn(
            `Unable to render ${osdUri} in OpenSeadragon as type: "${imageType}"`,
          );
          break;
      }
    }
  }, [imageType, osdUri]);

  return (
    <Wrapper
      className="clover-iiif-image-openseadragon"
      data-testid="clover-iiif-image-openseadragon"
      data-openseadragon-instance={config.id}
      hasNavigator={config.showNavigator}
      position="relative"
      overflow="hidden"
      height="100%"
    >
      <Controls
        _cloverViewerHasPlaceholder={_cloverViewerHasPlaceholder}
        config={config}
      />
      {config.showNavigator && (
        <Navigator
          id={config.navigatorId}
          data-testid="clover-iiif-image-openseadragon-navigator"
          top="3"
          left="3"
        />
      )}
      <Viewport
        id={config.id}
        data-testid="clover-iiif-image-openseadragon-viewport"
        role="img"
        position="absolute"
        height="100%"
        width="100%"
        {...(ariaLabel && { "aria-label": ariaLabel })}
      />
    </Wrapper>
  );
};

export default OSD;
