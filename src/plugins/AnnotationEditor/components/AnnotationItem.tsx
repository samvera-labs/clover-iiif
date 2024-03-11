// https://stackoverflow.com/questions/73103695/workaround-for-next-js-error-referenceerror-document-is-not-defined-for-an-ex
import React, { useEffect } from "react";
import {
  type PluginInformationPanel,
  parseAnnotationTarget,
  createOpenSeadragonRect,
} from "src/index";

interface PropType extends PluginInformationPanel {
  annotation: any;
  setActiveTarget: any;
  activeTarget: any;
}

const AnnotationItem: React.FC<PropType> = ({
  annotation,
  viewerConfigOptions,
  canvas,
  openSeadragonViewer,
  useViewerDispatch,
  setActiveTarget,
  activeTarget,
}) => {
  const dispatch: any = useViewerDispatch();

  // zoom to activeTarget when openSeadragonViewer changes
  useEffect(() => {
    if (!openSeadragonViewer) return;
    if (annotation.target != activeTarget) return;
    const zoomLevel = viewerConfigOptions.annotationOverlays?.zoomLevel || 1;

    const parsedAnnotationTarget = parseAnnotationTarget(annotation.target);
    const { rect, id } = parsedAnnotationTarget;

    if (rect) {
      if (canvas.id === id) {
        const rect2 = createOpenSeadragonRect(
          canvas,
          parsedAnnotationTarget,
          zoomLevel,
        );
        openSeadragonViewer?.viewport.fitBounds(rect2);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSeadragonViewer]);

  function handleClick() {
    if (!annotation.target) return;

    const zoomLevel = viewerConfigOptions.annotationOverlays?.zoomLevel || 1;

    const parsedAnnotationTarget = parseAnnotationTarget(annotation.target);
    const { rect, id } = parsedAnnotationTarget;

    if (rect) {
      if (canvas.id === id) {
        const rect2 = createOpenSeadragonRect(
          canvas,
          parsedAnnotationTarget,
          zoomLevel,
        );
        openSeadragonViewer?.viewport.fitBounds(rect2);
      } else {
        dispatch({
          type: "updateActiveCanvas",
          canvasId: id,
        });

        setActiveTarget(annotation.target);
      }
    }
  }

  function renderItem(body, i) {
    if (body.format === "image/jpeg") {
      return <img key={i} src={body.id} />;
    } else if (body.type === "TextualBody") {
      return <div key={i}>{body.value}</div>;
    }
  }

  return (
    <div onClick={handleClick}>
      {annotation.body.map((body, i) => renderItem(body, i))}
    </div>
  );
};

export default AnnotationItem;
