import {
  AnnotationNormalized,
  EmbeddedResource,
  InternationalString,
} from "@iiif/presentation-3";
import React, { useEffect } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";

import AnnotationItemHTML from "./HTML";
import AnnotationItemImage from "./Image";
import AnnotationItemMarkdown from "./Markdown";
import AnnotationItemPlainText from "./PlainText";
import AnnotationItemVTT from "./VTT/VTT";
import { Item as ItemStyled } from "src/components/Viewer/InformationPanel/Annotation/Item.styled";
import { NodeWebVttCueNested } from "src/hooks/use-webvtt";
import { getLanguageDirection } from "src/lib/annotation-helpers";

type Props = {
  annotation: AnnotationNormalized;
  targetResource?: string;
  isContentSearch?: boolean;
  isContentState?: boolean;
};

export const AnnotationItem: React.FC<Props> = ({
  annotation,
  targetResource,
  isContentSearch,
  isContentState,
}) => {
  const { target } = annotation;

  // @ts-ignore
  const selectorType = target?.selector?.type;

  // @ts-ignore
  const xywh = target?.selector?.value?.split("=")[1] || "full";
  const [w, h] = xywh !== "full" ? xywh?.split(",").slice(2) : [100, 100];

  const inlineCues: NodeWebVttCueNested[] | undefined =
    // @ts-ignore
    selectorType === "PointSelector" && target?.selector?.t
      ? [
          {
            // @ts-ignore
            start: target?.selector?.t,
            end: 0,
            html: " ",
            text: " ",
            styles: "",
            children: [],
          },
        ]
      : undefined;

  const computeSize = (w: number, h: number) => {
    const maxSize = 100;
    const ratio = Math.max(w, h);
    const newW = Math.round((w / ratio) * maxSize);
    const newH = Math.round((h / ratio) * maxSize);
    return [newW, newH].join(",");
  };

  const thumbnail = `${targetResource}/${xywh}/!${computeSize(w, h)}/0/default.jpg`;

  const viewerState: ViewerContextStore = useViewerState();
  const viewerDispatch: any = useViewerDispatch();

  const { openSeadragonViewer, vault, visibleCanvases } = viewerState;

  const annotationBody: Array<
    EmbeddedResource & {
      label?: InternationalString;
    }
  > = annotation?.body
    ? annotation?.body?.map((body) => vault.get(body.id))
    : [];

  // ignore due to `chars` not being defined in annotation bodies
  const {
    format = selectorType === "PointSelector" ? "text/vtt" : "text/plain",
    language = "none",
    value = "",
    // @ts-ignore
    chars = "",
  } = annotationBody[0] ? annotationBody[0] : {};

  const label = annotationBody[0]?.label || { none: ["t"] };

  const content = value || chars || "None";
  const readingDirection = language
    ? getLanguageDirection(language).toLocaleLowerCase()
    : "LTR";

  function handleOverlayZoom() {
    const overlay = openSeadragonViewer?.getOverlayById(annotation.id);

    if (overlay && openSeadragonViewer?.viewport) {
      // @ts-ignore
      if (overlay?.element) overlay.element?.focus();
      const bounds = overlay?.getBounds(openSeadragonViewer.viewport);

      // add some padding to the bounds
      bounds.x -= 0.2;
      bounds.y -= 0.2;
      bounds.width += 0.5;
      bounds.height += 0.5;

      openSeadragonViewer.viewport.fitBounds(bounds, false);
    }
  }

  useEffect(() => {
    if (!openSeadragonViewer || !isContentState) return;

    const intervalId = setInterval(() => {
      const overlay = openSeadragonViewer?.getOverlayById(annotation.id);
      if (overlay) {
        handleOverlayZoom();
        openSeadragonViewer.container.className = "clover-iiif-content-state";
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [openSeadragonViewer, isContentState]);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // @ts-ignore
    const targetSource = annotation?.target?.source || annotation?.target;
    const targetCanvas = targetSource?.id;
    const isVisibleCanvas = visibleCanvases
      .map((canvas) => canvas.id)
      .includes(targetCanvas);

    if (isVisibleCanvas) {
      handleOverlayZoom();
    } else {
      viewerDispatch({
        type: "updateActiveCanvas",
        canvasId: targetCanvas,
      });
    }
  }

  function renderItemBody() {
    switch (format) {
      case "text/plain":
        return (
          <AnnotationItemPlainText
            value={content}
            handleClick={handleClick}
            isContentSearch={isContentSearch}
          />
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
            inlineCues={inlineCues}
            label={label}
            vttUri={annotationBody[0]?.id || undefined}
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

  return (
    <ItemStyled
      dir={readingDirection}
      data-format={format}
      data-content={content}
      className="clover-iiif-annotation-item"
    >
      <span
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></span>
      {renderItemBody()}
    </ItemStyled>
  );
};

export default AnnotationItem;
