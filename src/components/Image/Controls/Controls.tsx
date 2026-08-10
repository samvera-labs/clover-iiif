import {
  ControlButtons,
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import Button from "src/components/Image/Controls/Button";
import { CanvasNormalized } from "@iiif/presentation-3";
import { Options } from "openseadragon";
import React, { useEffect } from "react";
import { Wrapper } from "src/components/Image/Controls/Controls.styled";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

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

/**
 * Clover's glyphs are bare `path` elements, so a replacement gets them wrapped
 * in an svg it can drop straight in. Decorative, since the button carries the
 * name.
 */
const ControlIcon = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    stroke="currentColor"
    focusable="false"
    aria-hidden="true"
    role="presentation"
    data-testid="openseadragon-button-svg"
    data-label={label}
  >
    {children}
  </svg>
);

const Controls = ({
  _cloverViewerHasPlaceholder,
  config,
}: {
  _cloverViewerHasPlaceholder: boolean;
  config: Options;
}) => {
  const { t } = useCloverTranslation();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    activeCanvas,
    configOptions,
    isInformationOpen,
    plugins,
    vault,
    openSeadragonViewer,
  } = viewerState;
  const hasInformationToggle = Boolean(
    configOptions.informationPanel?.renderToggle,
  );

  /**
   * Renders a consumer's control in place of the default when one is configured.
   * The replacement owns the element, so it is handed props to spread rather than
   * being told what to render: OpenSeadragon binds by element id, and the
   * accessible name has to survive whatever markup the consumer chooses.
   */
  function renderControl(
    key: keyof ControlButtons,
    id: string,
    label: string,
    glyph: React.ReactElement,
  ) {
    const Custom = configOptions.controlButtons?.[key];
    if (Custom)
      return (
        <Custom
          buttonProps={{ id, type: "button", "aria-label": label }}
          icon={<ControlIcon label={label}>{glyph}</ControlIcon>}
          label={label}
        />
      );
    return (
      <Button id={id} label={label}>
        {glyph}
      </Button>
    );
  }

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

  /**
   * Every control OpenSeadragon binds, paired with the flag that renders it.
   */
  const controlIds: Array<[keyof ControlButtons, unknown, boolean]> = [
    ["zoomIn", config.zoomInButton, !!config.showZoomControl],
    ["zoomOut", config.zoomOutButton, !!config.showZoomControl],
    ["fullPage", config.fullPageButton, !!config.showFullPageControl],
    ["rotateRight", config.rotateRightButton, !!config.showRotationControl],
    ["rotateLeft", config.rotateLeftButton, !!config.showRotationControl],
    ["reset", config.homeButton, !!config.showHomeControl],
  ];

  /*
   * A replacement that does not render the id it is given still looks correct,
   * but OpenSeadragon binds to an element that is not in the document and the
   * control does nothing. Say so rather than leaving it to be found by hand.
   */
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    controlIds.forEach(([key, id, shown]) => {
      if (!shown) return;
      if (!configOptions.controlButtons?.[key] || typeof id !== "string")
        return;
      if (document.getElementById(id)) return;
      console.warn(
        `Clover IIIF: the controlButtons.${key} component does not render the id it was given ("${id}"), so OpenSeadragon cannot bind to it and the control will not work.`,
      );
    });
  }, [config, configOptions.controlButtons]);

  useEffect(() => {
    if (!openSeadragonViewer) return;

    const initialRotation = openSeadragonViewer.viewport.getRotation();

    openSeadragonViewer.addHandler("home", () => {
      openSeadragonViewer.viewport.setRotation(initialRotation);
    });
  }, [openSeadragonViewer]);

  /*
   * OpenSeadragon moves the viewer in and out of the DOM to go full page, which
   * drops focus. Without this a keyboard user is returned to the top of the
   * document and has to tab back to the controls.
   */
  useEffect(() => {
    if (!openSeadragonViewer) return;

    // "full-page" fires on both entering and exiting full page mode, with
    // fullPage true on entry. Only restore focus on exit, when OSD has just
    // moved the viewer back into its original place in the DOM.
    const restoreFocus = ({ fullPage }: { fullPage: boolean }) => {
      if (fullPage) return;
      const button = document.getElementById(config.fullPageButton as string);
      if (button) button.focus();
    };

    openSeadragonViewer.addHandler("full-page", restoreFocus);
    return () => openSeadragonViewer.removeHandler("full-page", restoreFocus);
  }, [openSeadragonViewer, config.fullPageButton]);

  return (
    <Wrapper
      data-testid="clover-iiif-image-openseadragon-controls"
      hasPlaceholder={_cloverViewerHasPlaceholder}
      hasInformationToggle={hasInformationToggle}
      panelOpen={isInformationOpen}
    >
      {config.showZoomControl && (
        <>
          {renderControl(
            "zoomIn",
            config.zoomInButton as string,
            t("imageZoomIn"),
            <ZoomIn />,
          )}
          {renderControl(
            "zoomOut",
            config.zoomOutButton as string,
            t("imageZoomOut"),
            <ZoomOut />,
          )}
        </>
      )}
      {config.showFullPageControl &&
        renderControl(
          "fullPage",
          config.fullPageButton as string,
          t("imageFullScreen"),
          <ZoomFullScreen />,
        )}
      {config.showRotationControl && (
        <>
          {renderControl(
            "rotateRight",
            config.rotateRightButton as string,
            t("imageRotateRight"),
            <Rotate />,
          )}
          {renderControl(
            "rotateLeft",
            config.rotateLeftButton as string,
            t("imageRotateLeft"),
            <Rotate />,
          )}
        </>
      )}
      {config.showHomeControl &&
        renderControl(
          "reset",
          config.homeButton as string,
          t("imageResetZoom"),
          <Reset />,
        )}
      {renderPlugins()}
    </Wrapper>
  );
};

export default Controls;
