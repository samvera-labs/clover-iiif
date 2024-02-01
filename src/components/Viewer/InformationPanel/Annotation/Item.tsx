import React from "react";
import { Item as ItemStyled } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { ViewerContextStore, useViewerState } from "src/context/viewer-context";
import {
  AnnotationNormalized,
  type CanvasNormalized,
  EmbeddedResource,
  InternationalString,
} from "@iiif/presentation-3";
import AnnotationItemPlainText from "./PlainText";
import AnnotationItemHTML from "./HTML";
import AnnotationItemVTT from "./VTT/VTT";
import { parseAnnotationTarget } from "src/lib/annotation-helpers";
import { createOpenSeadragonRect } from "src/lib/openseadragon-helpers";
import AnnotationItemImage from "./Image";

type Props = {
  annotation: AnnotationNormalized;
};

export const AnnotationItem: React.FC<Props> = ({ annotation }) => {
  const viewerState: ViewerContextStore = useViewerState();
  const { openSeadragonViewer, vault, activeCanvas, configOptions } =
    viewerState;

  const annotationBody: Array<
    EmbeddedResource & {
      label?: InternationalString;
    }
  > = annotation.body.map((body) => vault.get(body.id));
  const annotationBodyFormat =
    annotationBody.find((body) => body.format)?.format || "";
  const annotationBodyValue =
    annotationBody.find((body) => body.value)?.value || "";

  function renderItemBody(annotation: AnnotationNormalized) {
    const { target } = annotation;

    const canvas: CanvasNormalized = vault.get({
      id: activeCanvas,
      type: "Canvas",
    });

    function handleClick() {
      if (!target) return;

      const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;
      // @ts-ignore
      const parsedAnnotationTarget = parseAnnotationTarget(target);

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

    switch (annotationBodyFormat) {
      case "text/plain":
        return (
          <AnnotationItemPlainText
            value={annotationBodyValue}
            handleClick={handleClick}
          />
        );
      case "text/html":
        return (
          <AnnotationItemHTML
            value={annotationBodyValue}
            handleClick={handleClick}
          />
        );
      case "text/vtt":
        return (
          <AnnotationItemVTT
            label={annotationBody[0].label}
            vttUri={annotationBody[0].id || ""}
          />
        );
      default:
        // Is annotation body format is of type "image/*"?
        if (/^image\//.test(annotationBodyFormat)) {
          const imageUri =
            annotationBody.find((body) => !body.id?.includes("vault://"))?.id ||
            "";
          return (
            <AnnotationItemImage
              caption={annotationBodyValue}
              handleClick={handleClick}
              imageUri={imageUri}
            />
          );
        }

        return (
          <AnnotationItemPlainText
            value={annotationBodyValue}
            handleClick={handleClick}
          />
        );
    }
  }

  return <ItemStyled>{renderItemBody(annotation)}</ItemStyled>;
};

export default AnnotationItem;
