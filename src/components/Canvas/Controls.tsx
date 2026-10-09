import React, { useCallback, useState } from "react";

import type { CanvasControlsConfig } from "src/components/Canvas/Canvas.types";
import AnnotationMenu from "src/components/Canvas/AnnotationMenu";
import type { PlacedAnnotation } from "src/components/Canvas/Annotations";
import ChoiceMenu from "src/components/Canvas/ChoiceMenu";
import { Comment } from "src/components/Canvas/glyphs";
import Button from "src/components/Image/Controls/Button";
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
  /** The Canvas's drawable annotations. With any, a control to list them appears. */
  annotations?: PlacedAnnotation[];
  selectedAnnotation?: string | null;
  onAnnotationSelect?: (annotation: PlacedAnnotation) => void;
  onAnnotationActivate?: (id: string | null) => void;
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
  annotations = [],
  selectedAnnotation = null,
  onAnnotationSelect,
  onAnnotationActivate,
  children,
}) => {
  const { t } = useCloverTranslation();
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const annotationsId = `annotations-${instance}`;
  const annotationsMenuId = `${annotationsId}-menu`;
  // The Information panel's word for them, so no new string is needed.
  const annotationsLabel = t("informationPanelTabsAnnotations");
  const closeAnnotations = useCallback(
    (restoreFocus: boolean) => {
      setAnnotationsOpen(false);
      onAnnotationActivate?.(null);
      if (restoreFocus) document.getElementById(annotationsId)?.focus();
    },
    [annotationsId, onAnnotationActivate],
  );
  const showAnnotations =
    config.annotations && annotations.length > 0 && onAnnotationSelect;
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
      {/*
        Not a `ControlSpec`: those are keyed by the Viewer's `ControlButtons`, and this
        control is Canvas's alone, so it is not replaceable through `controlButtons`.
      */}
      {showAnnotations && (
        <Button
          id={annotationsId}
          label={annotationsLabel}
          onClick={() => setAnnotationsOpen((open) => !open)}
          expanded={annotationsOpen}
          controls={annotationsMenuId}
        >
          <Comment />
        </Button>
      )}
      {children}
      {annotationsOpen && showAnnotations && (
        <AnnotationMenu
          id={annotationsMenuId}
          triggerId={annotationsId}
          label={annotationsLabel}
          annotations={annotations}
          selected={selectedAnnotation}
          onSelect={onAnnotationSelect}
          onActivate={(id) => onAnnotationActivate?.(id)}
          onClose={closeAnnotations}
        />
      )}
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
