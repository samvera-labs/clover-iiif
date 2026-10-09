import {
  ControlButtons,
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import ControlCluster, {
  type ControlSpec,
} from "src/components/Image/Controls/ControlCluster";
import {
  Reset,
  Rotate,
  ZoomExitFullScreen,
  ZoomFullScreen,
  ZoomIn,
  ZoomOut,
} from "src/components/Image/Controls/glyphs";
import { CanvasNormalized } from "@iiif/presentation-3";
import { Options } from "openseadragon";
import React, { useEffect } from "react";
import { toggleFullscreen } from "src/lib/fullscreen";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

/**
 * `Image`'s controls: the shared cluster, wired to the Viewer context, i18n, and
 * OpenSeadragon — which binds every control except full screen by element id.
 */
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

  /*
   * Full screen is Clover's, not OpenSeadragon's.
   *
   * Called straight from the click rather than routed through state: the Fullscreen API only
   * honours a request made inside a user gesture, and a dispatch followed by an effect can
   * land outside it. The root is found from the button itself, so the same control serves a
   * standalone `Image` and one nested in a `Viewer` without either being told which it is.
   */
  const handleFullscreen: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => void toggleFullscreen(event.currentTarget);

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
   * Nothing to restore focus for any more.
   *
   * This listened for OpenSeadragon's `full-page` event and put focus back on the button,
   * because OpenSeadragon moved the viewer out of the DOM and back, dropping focus on the
   * way. Clover full-screens its own root now: no element is reparented, so focus stays
   * where the reader left it and the event never fires.
   */

  const controls = (isFullscreen: boolean): ControlSpec[] => [
    ...(config.showZoomControl
      ? [
          {
            key: "zoomIn" as const,
            id: config.zoomInButton as string,
            label: t("imageZoomIn"),
            glyph: <ZoomIn />,
          },
          {
            key: "zoomOut" as const,
            id: config.zoomOutButton as string,
            label: t("imageZoomOut"),
            glyph: <ZoomOut />,
          },
        ]
      : []),
    ...(config.showFullPageControl
      ? [
          {
            key: "fullPage" as const,
            id: config.fullPageButton as string,
            label: isFullscreen
              ? t("imageExitFullScreen")
              : t("imageFullScreen"),
            glyph: isFullscreen ? <ZoomExitFullScreen /> : <ZoomFullScreen />,
            onClick: handleFullscreen,
          },
        ]
      : []),
    ...(config.showRotationControl
      ? [
          {
            key: "rotateRight" as const,
            id: config.rotateRightButton as string,
            label: t("imageRotateRight"),
            glyph: <Rotate />,
          },
          {
            key: "rotateLeft" as const,
            id: config.rotateLeftButton as string,
            label: t("imageRotateLeft"),
            glyph: <Rotate />,
          },
        ]
      : []),
    ...(config.showHomeControl
      ? [
          {
            key: "reset" as const,
            id: config.homeButton as string,
            label: t("imageResetZoom"),
            glyph: <Reset />,
          },
        ]
      : []),
  ];

  return (
    <ControlCluster
      controls={controls}
      controlButtons={configOptions.controlButtons}
      hasPlaceholder={Boolean(_cloverViewerHasPlaceholder)}
      hasInformationToggle={hasInformationToggle}
      isPanelOpen={Boolean(isInformationOpen)}
    >
      {renderPlugins()}
    </ControlCluster>
  );
};

export default Controls;
