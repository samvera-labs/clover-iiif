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
import { parseAnnotationTarget } from "src/lib/annotation-helpers";
import { createOpenSeadragonRect } from "src/lib/openseadragon-helpers";
import AnnotationItemPlainText from "./PlainText";

type Props = {
  annotation: AnnotationNormalized;
  activeTarget: string | undefined;
  setActiveTarget: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const ContentSearchItem: React.FC<Props> = ({
  annotation,
  activeTarget,
  setActiveTarget,
}) => {
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    openSeadragonViewer,
    vault,
    contentSearchVault,
    activeCanvas,
    configOptions,
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

  function panToTarget() {
    const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;

    const parsedAnnotationTarget = parseAnnotationTarget(annotationTarget);

    const { point, rect, svg } = parsedAnnotationTarget;

    if (point || rect || svg) {
      const rect = createOpenSeadragonRect(
        canvas,
        parsedAnnotationTarget,
        zoomLevel,
      );
      openSeadragonViewer?.viewport.fitBounds(rect);
    }
  }

  // when openSeadragonViewer changes, then zoom to target
  useEffect(() => {
    if (!openSeadragonViewer) return;
    if (annotationTarget != activeTarget) return;

    panToTarget();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSeadragonViewer]);

  function handleClick(e) {
    if (!openSeadragonViewer) return;

    const target = JSON.parse(e.target.dataset.target);
    const canvasId = e.target.dataset.canvas;

    // if activeCanvas does not change, then zoom to target
    if (activeCanvas === canvasId) {
      panToTarget();

      // else activeCanvas does change, which will trigger rerendering <OSD />
      // and creating new openseadragon viewer
    } else {
      dispatch({
        type: "updateActiveCanvas",
        canvasId: canvasId,
      });
      setActiveTarget(target);
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
