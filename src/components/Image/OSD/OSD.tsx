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
  const [osdDrawn, setOsdDrawn] = useState(false);
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
    if (openSeadragon && openSeadragonCallback)
      openSeadragonCallback(openSeadragon);
  }, [openSeadragon, openSeadragonCallback]);

  useEffect(() => {
    if (openSeadragon && JSON.stringify(uri) !== JSON.stringify(osdUri)) {
      openSeadragon?.forceRedraw();
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

        case "tiledImage":
          for (let i = 0; i < osdUri.length; i++) {
            try {
              const tileSource = await getInfoResponse(osdUri[i]);
              if (!tileSource)
                throw new Error(`No tile source for ${osdUri[i]}`);

              openSeadragon.addTiledImage({
                tileSource,
                x: i * 1,
                y: 0,
                success: () => {
                  if (typeof dispatch === "function") {
                    dispatch({
                      type: "updateOSDImageLoaded",
                      OSDImageLoaded: true,
                    });
                  }
                },
              });

              console.log("Tile source loaded", tileSource);
            } catch (e) {
              console.error(e);
            }
          }
          break;

        default:
          console.warn(`Unsupported imageType: "${imageType}"`);
          break;
      }
    };

    load()
      .then(() => setOsdDrawn(true))
      .catch((error) => console.error("Error drawing tiles", error));
  }, [osdUri, imageType, openSeadragon]);

  useEffect(() => {
    if (osdDrawn) {
      openSeadragon?.viewport.fitHorizontally(true);
      openSeadragon?.viewport.fitVertically(true);
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
