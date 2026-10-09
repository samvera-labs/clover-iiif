import React, { useCallback, useState } from "react";

import type { CanvasControlsConfig } from "src/components/Canvas/Canvas.types";
import ChoiceMenu from "src/components/Canvas/ChoiceMenu";
import type {
  ChoiceGroup,
  ChoiceSelections,
} from "src/components/Canvas/layout";
import ControlCluster, {
  type ControlSpec,
} from "src/components/Image/Controls/ControlCluster";
import {
  Choice,
  Reset,
  Rotate,
  ZoomExitFullScreen,
  ZoomFullScreen,
  ZoomIn,
  ZoomOut,
} from "src/components/Image/Controls/glyphs";
import type { ControlButtons } from "src/context/viewer-context";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { getLabelAsString } from "src/lib/label-helpers";
import { toggleFullscreen } from "src/lib/fullscreen";
import type { CanvasRenderer } from "src/lib/renderer";

/** OpenSeadragon's `zoomPerClick`. */
const ZOOM_PER_CLICK = 2;

interface CanvasControlsProps {
  renderer: CanvasRenderer;
  instance: string;
  config: Required<CanvasControlsConfig>;
  controlButtons?: ControlButtons;
  hasPlaceholder?: boolean;
  hasInformationToggle?: boolean;
  isPanelOpen?: boolean;
  /** The Canvas's `Choice`s. With any, a control to pick among their items appears. */
  choices?: ChoiceGroup[];
  selections?: ChoiceSelections;
  onSelect?: (key: string, index: number) => void;
  children?: React.ReactNode;
}

/**
 * `Canvas`'s controls: the same cluster `Image` renders — markup, layout hooks and the
 * `controlButtons` contract — driven by click handlers instead of OpenSeadragon's id
 * binding. Ids keep the `<key>-<instance>` shape so `data-button` reads the same.
 */
const Controls: React.FC<CanvasControlsProps> = ({
  renderer,
  instance,
  config,
  controlButtons,
  hasPlaceholder,
  hasInformationToggle,
  isPanelOpen,
  choices = [],
  selections = {},
  onSelect,
  children,
}) => {
  const { t } = useCloverTranslation();
  const [choiceOpen, setChoiceOpen] = useState(false);
  const choiceId = `choice-${instance}`;
  /*
   * The control is named by the Manifest where it can be: the Choice's own `label` when
   * there is one Choice that has one. Otherwise the IIIF term, so an icon-only button
   * still has a name for assistive technology.
   */
  const choiceLabel =
    (choices.length === 1 && getLabelAsString(choices[0].label as any)) ||
    t("canvasChoice");
  const menuId = `${choiceId}-menu`;
  const closeChoice = useCallback(
    (restoreFocus: boolean) => {
      setChoiceOpen(false);
      if (restoreFocus) document.getElementById(choiceId)?.focus();
    },
    [choiceId],
  );

  const controls = (isFullscreen: boolean): ControlSpec[] => {
    const specs: ControlSpec[] = [];
    if (config.zoom) {
      specs.push(
        {
          key: "zoomIn",
          id: `zoomIn-${instance}`,
          label: t("imageZoomIn"),
          glyph: <ZoomIn />,
          onClick: () => renderer.zoomBy(ZOOM_PER_CLICK),
        },
        {
          key: "zoomOut",
          id: `zoomOut-${instance}`,
          label: t("imageZoomOut"),
          glyph: <ZoomOut />,
          onClick: () => renderer.zoomBy(1 / ZOOM_PER_CLICK),
        },
      );
    }
    if (config.fullPage) {
      specs.push({
        key: "fullPage",
        id: `fullPage-${instance}`,
        label: isFullscreen ? t("imageExitFullScreen") : t("imageFullScreen"),
        glyph: isFullscreen ? <ZoomExitFullScreen /> : <ZoomFullScreen />,
        // Straight from the click: the Fullscreen API only honours a user gesture.
        onClick: (event) => void toggleFullscreen(event.currentTarget),
      });
    }
    if (config.rotation) {
      specs.push(
        {
          key: "rotateRight",
          id: `rotateRight-${instance}`,
          label: t("imageRotateRight"),
          glyph: <Rotate />,
          onClick: () => renderer.rotateBy(90),
        },
        {
          key: "rotateLeft",
          id: `rotateLeft-${instance}`,
          label: t("imageRotateLeft"),
          glyph: <Rotate />,
          onClick: () => renderer.rotateBy(-90),
        },
      );
    }
    if (config.reset) {
      specs.push({
        key: "reset",
        id: `reset-${instance}`,
        label: t("imageResetZoom"),
        glyph: <Reset />,
        // Home also turns the image upright, as `Image`'s reset does.
        onClick: () => renderer.home(),
      });
    }
    if (choices.length) {
      specs.push({
        key: "choice",
        id: choiceId,
        label: choiceLabel,
        glyph: <Choice />,
        onClick: () => setChoiceOpen((open) => !open),
        expanded: choiceOpen,
        controls: menuId,
      });
    }
    return specs;
  };

  return (
    <ControlCluster
      controls={controls}
      controlButtons={controlButtons}
      hasPlaceholder={hasPlaceholder}
      hasInformationToggle={hasInformationToggle}
      isPanelOpen={isPanelOpen}
    >
      {children}
      {choiceOpen && choices.length > 0 && onSelect && (
        <ChoiceMenu
          id={menuId}
          triggerId={choiceId}
          label={choiceLabel}
          choices={choices}
          selections={selections}
          onSelect={onSelect}
          onClose={closeChoice}
        />
      )}
    </ControlCluster>
  );
};

export default Controls;
