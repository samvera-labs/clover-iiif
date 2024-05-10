import React, { useEffect } from "react";
import { Item as ItemStyled } from "./Item.styled";

import {
  ViewerContextStore,
  useViewerState,
  useViewerDispatch,
} from "src/context/viewer-context";
import {
  type CanvasNormalized,
  AnnotationNormalized,
  EmbeddedResource,
  InternationalString,
} from "@iiif/presentation-3";
import { panToTarget } from "src/lib/openseadragon-helpers";

import AnnotationItemPlainText from "./PlainText";

type Props = {
  annotation: AnnotationNormalized;
  activeContentSearchTarget?: string;
  setActiveContentSearchTarget: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

export const ContentSearchItem: React.FC<Props> = ({
  annotation,
  activeContentSearchTarget,
  setActiveContentSearchTarget,
}) => {
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    openSeadragonViewer,
    vault,
    contentSearchVault,
    activeCanvas,
    configOptions,
    OSDImageLoaded,
  } = viewerState;

  const canvas: CanvasNormalized = vault.get({
    id: activeCanvas,
    type: "Canvas",
  });

  const annotationBody: Array<
    EmbeddedResource & {
      label?: InternationalString;
    }
  > = annotation.body.map((body) => contentSearchVault.get(body.id));

  const annotationBodyValue =
    annotationBody.find((body) => body.value)?.value || "";

  let annotationTarget;
  if (annotation.target) {
    if (typeof annotation.target === "string") {
      annotationTarget = annotation.target;
    }
  }

  let annotationCanvas;
  if (annotationTarget) {
    const parts = annotationTarget.split("#xywh");
    if (parts.length > 1) {
      annotationCanvas = parts[0];
    }
  }

  const zoomLevel = configOptions.contentSearch?.overlays?.zoomLevel || 1;

  // zoom to activeTarget when openSeadragonViewer changes
  useEffect(() => {
    if (!OSDImageLoaded) return;
    if (!openSeadragonViewer) return;
    if (!annotation.target) return;
    if (annotation.target != activeContentSearchTarget) return;

    panToTarget(openSeadragonViewer, zoomLevel, annotationTarget, canvas);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSeadragonViewer, OSDImageLoaded]);

  function handleClick(e) {
    if (!openSeadragonViewer) return;

    const target = JSON.parse(e.target.dataset.target);
    const canvasId = e.target.dataset.canvas;

    // if activeCanvas does not change, then zoom to target
    if (activeCanvas === canvasId) {
      panToTarget(openSeadragonViewer, zoomLevel, annotationTarget, canvas);

      // else change canvas and then zoom to target
    } else {
      dispatch({
        type: "updateOSDImageLoaded",
        OSDImageLoaded: false,
      });
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
      setActiveContentSearchTarget(target);
    }
  }

  const targetJson = JSON.stringify(annotationTarget);

  return (
    <ItemStyled>
      <AnnotationItemPlainText
        target={targetJson}
        canvas={annotationCanvas}
        value={annotationBodyValue}
        handleClick={handleClick}
      />
    </ItemStyled>
  );
};

export default ContentSearchItem;
