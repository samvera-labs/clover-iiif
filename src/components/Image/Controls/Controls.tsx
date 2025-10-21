import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import Button from "src/components/Image/Controls/Button";
import { CanvasNormalized } from "@iiif/presentation-3";
import { Options } from "openseadragon";
import React, { useEffect } from "react";
import { Wrapper } from "src/components/Image/Controls/Controls.styled";
import { useTranslation } from "react-i18next";

const ZoomIn = () => {
  return (
    <path
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="45"
      d="M256 112v288M400 256H112"
    />
  );
};

const ZoomOut = () => {
  return (
    <path
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="45"
      d="M400 256H112"
    />
  );
};

const ZoomFullScreen = () => {
  return (
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
      d="M432 320v112H320M421.8 421.77L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320M90.23 421.8L208 304"
    />
  );
};

const Reset = () => {
  return (
    <path d="M448 440a16 16 0 01-12.61-6.15c-22.86-29.27-44.07-51.86-73.32-67C335 352.88 301 345.59 256 344.23V424a16 16 0 01-27 11.57l-176-168a16 16 0 010-23.14l176-168A16 16 0 01256 88v80.36c74.14 3.41 129.38 30.91 164.35 81.87C449.32 292.44 464 350.9 464 424a16 16 0 01-16 16z" />
  );
};

const Rotate = () => {
  return (
    <>
      <path
        fill="none"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="45"
        d="M400 148l-21.12-24.57A191.43 191.43 0 00240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 00181.07-128"
      />
      <path d="M464 97.42V208a16 16 0 01-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z" />
    </>
  );
};

const Controls = ({
  _cloverViewerHasPlaceholder,
  config,
}: {
  _cloverViewerHasPlaceholder: boolean;
  config: Options;
}) => {
  const { t } = useTranslation();
  const viewerState: ViewerContextStore = useViewerState();
  const { activeCanvas, plugins, vault, openSeadragonViewer } = viewerState;

  const canvas = vault.get({
    id: activeCanvas,
    type: "Canvas",
  }) as CanvasNormalized;

  function renderPlugins() {
    return plugins
      .filter((plugin) => plugin.imageViewer?.controls)
      .map((plugin, i) => {
        const PluginComponent = plugin.imageViewer?.controls
          ?.component as unknown as React.ElementType;
        return (
          <PluginComponent
            key={i}
            {...plugin?.imageViewer?.controls?.componentProps}
            canvas={canvas}
            useViewerDispatch={useViewerDispatch}
            useViewerState={useViewerState}
          ></PluginComponent>
        );
      });
  }

  useEffect(() => {
    if (!openSeadragonViewer) return;

    const initialRotation = openSeadragonViewer.viewport.getRotation();

    openSeadragonViewer.addHandler("home", () => {
      openSeadragonViewer.viewport.setRotation(initialRotation);
    });
  }, [openSeadragonViewer]);

  return (
    <Wrapper
      data-testid="clover-iiif-image-openseadragon-controls"
      hasPlaceholder={_cloverViewerHasPlaceholder}
    >
      {config.showZoomControl && (
        <>
          <Button id={config.zoomInButton as string} label={t("imageZoomIn")}>
            <ZoomIn />
          </Button>
          <Button id={config.zoomOutButton as string} label={t("imageZoomOut")}>
            <ZoomOut />
          </Button>
        </>
      )}
      {config.showFullPageControl && (
        <Button
          id={config.fullPageButton as string}
          label={t("imageFullScreen")}
        >
          <ZoomFullScreen />
        </Button>
      )}
      {config.showRotationControl && (
        <>
          <Button
            id={config.rotateRightButton as string}
            label={t("imageRotateRight")}
          >
            <Rotate />
          </Button>
          <Button
            id={config.rotateLeftButton as string}
            label={t("imageRotateLeft")}
          >
            <Rotate />
          </Button>
        </>
      )}
      {config.showHomeControl && (
        <Button id={config.homeButton as string} label={t("imageResetZoom")}>
          <Reset />
        </Button>
      )}
      {renderPlugins()}
    </Wrapper>
  );
};

export default Controls;
