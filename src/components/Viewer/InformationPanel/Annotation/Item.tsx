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
import { panToTarget } from "src/lib/openseadragon-helpers";
import AnnotationItemImage from "./Image";
import AnnotationItemMarkdown from "./Markdown";
import { getLanguageDirection } from "src/lib/annotation-helpers";

type Props = {
  annotation: AnnotationNormalized;
};

export const AnnotationItem: React.FC<Props> = ({ annotation }) => {
  const { target } = annotation;

  const viewerState: ViewerContextStore = useViewerState();
  const { openSeadragonViewer, vault, activeCanvas, configOptions } =
    viewerState;

  const annotationBody: Array<
    EmbeddedResource & {
      label?: InternationalString;
    }
  > = annotation.body.map((body) => vault.get(body.id));

  // ignore due to `chars` not being defined in annotation bodies
  // @ts-ignore
  const { format, language = "en", value = "", chars = "" } = annotationBody[0];

  const content = value || chars;

  const readingDirection = getLanguageDirection(language).toLocaleLowerCase();

  const canvas = vault.get({
    id: activeCanvas,
    type: "Canvas",
  }) as CanvasNormalized;

  function handleClick() {
    if (!target) return;

    const zoomLevel = configOptions.annotationOverlays?.zoomLevel || 1;
    panToTarget(openSeadragonViewer, zoomLevel, target, canvas);
  }

  function renderItemBody() {
    switch (format) {
      case "text/plain":
        return (
          <AnnotationItemPlainText value={content} handleClick={handleClick} />
        );
      case "text/html":
        return <AnnotationItemHTML value={content} handleClick={handleClick} />;
      case "text/markdown":
        return (
          <AnnotationItemMarkdown value={content} handleClick={handleClick} />
        );
      case "text/vtt":
        return (
          <AnnotationItemVTT
            label={annotationBody[0].label}
            vttUri={annotationBody[0].id || ""}
          />
        );
      case format?.match(/^image\//)?.input:
        const imageUri =
          annotationBody.find((body) => !body.id?.includes("vault://"))?.id ||
          "";
        return (
          <AnnotationItemImage
            caption={value}
            handleClick={handleClick}
            imageUri={imageUri}
          />
        );
      default:
        return (
          <AnnotationItemPlainText value={content} handleClick={handleClick} />
        );
    }
  }

  return <ItemStyled dir={readingDirection}>{renderItemBody()}</ItemStyled>;
};

export default AnnotationItem;
