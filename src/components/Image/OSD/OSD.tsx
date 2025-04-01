import {
  Navigator,
  Viewport,
  Wrapper,
} from "src/components/Image/Image.styled";
import OpenSeadragon, { Options } from "openseadragon";
import React, { useEffect, useRef, useState } from "react";

import Controls from "src/components/Image/Controls/Controls";
import { OpenSeadragonImageTypes } from "src/types/open-seadragon";
import { getInfoResponse } from "src/lib/iiif";
import { retry } from "src/lib/retry";
import { useViewerDispatch } from "src/context/viewer-context";

interface OSDProps {
  _cloverViewerHasPlaceholder: boolean;
  ariaLabel?: string | null;
  config: Options;
  uri: string[];
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
  const [osdDrawn, setOsdDrawn] = useState<string[]>([]);
  const [osdUri, setOsdUri] = useState<string[]>([]);
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
    if (openSeadragon && openSeadragonCallback) {
      openSeadragonCallback(openSeadragon);
    }
  }, [openSeadragon, openSeadragonCallback]);

  useEffect(() => {
    if (openSeadragon && JSON.stringify(uri) !== JSON.stringify(osdUri)) {
      openSeadragon.forceRedraw();
      setOsdUri(uri);
    }
  }, [openSeadragon, osdUri, uri]);

  useEffect(() => {
    if (!osdUri.length || !openSeadragon) return;

    openSeadragon.close(); // remove previous images

    const load = async () => {
      switch (imageType) {
        case "simpleImage":
          osdUri.forEach((url) => {
            openSeadragon.addSimpleImage({ url });
          });
          break;

        case "tiledImage": {
          let height = 1;
          let x = 0;
          let baseTileSource;

          for (let i = 0; i < osdUri.length; i++) {
            const url = osdUri[i];
            try {
              const tileSource = await retry(
                () => getInfoResponse(url),
                3,
                1000,
              );

              if (!tileSource) throw new Error(`No tile source for ${url}`);

              if (i === 0) {
                baseTileSource = tileSource;
              } else {
                const baseItem = openSeadragon.world.getItemAt(0);
                if (baseItem) {
                  const baseBounds = baseItem.getBounds();
                  x = baseBounds.x + baseBounds.width;
                  height = baseBounds.height;
                } else {
                  throw new Error(`No base item found at index 0`);
                }
              }

              openSeadragon.addTiledImage({
                tileSource,
                x,
                y: 0,
                height,
                success: () => {
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });

              setOsdDrawn((prev) => [...prev, url]);
            } catch (e) {
              console.error(`Failed to load tile at ${url}:`, e);
            }
          }

          break;
        }

        default:
          console.warn(`Unsupported imageType: "${imageType}"`);
          break;
      }
    };

    load().catch((error) => console.error("Error drawing tiles", error));
  }, [osdUri, imageType, openSeadragon]);

  useEffect(() => {
    if (osdDrawn) {
      const bounds = openSeadragon?.world.getHomeBounds();
      if (bounds) openSeadragon?.viewport.fitBounds(bounds, true);
    }
  }, [osdDrawn]);

  return (
    <Wrapper
      className="clover-iiif-image-openseadragon"
      data-testid="clover-iiif-image-openseadragon"
      data-openseadragon-instance={config.id}
      hasNavigator={config.showNavigator}
    >
      <Controls
        _cloverViewerHasPlaceholder={_cloverViewerHasPlaceholder}
        config={config}
      />
      {config.showNavigator && (
        <Navigator
          id={config.navigatorId}
          data-testid="clover-iiif-image-openseadragon-navigator"
        />
      )}
      <Viewport
        id={config.id}
        data-testid="clover-iiif-image-openseadragon-viewport"
        role="img"
        {...(ariaLabel && { "aria-label": ariaLabel })}
      />
    </Wrapper>
  );
};

export default OSD;
