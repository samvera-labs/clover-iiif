import React, { useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
} from "src/context/viewer-context";
import {
  AnnotationCollectionNormalized,
  AnnotationRaw,
} from "src/types/annotation-collection";
import {
  getAnnotationBodyText,
  getManifestFromAnnotationTarget,
} from "src/lib/annotation-collection";
import { zoomToOverlay } from "src/lib/openseadragon-helpers";
import { getPaintingResource } from "src/hooks/use-iiif";
import { Label } from "src/components/Primitives";
import {
  ButtonStyled,
  Group,
  Item,
  StyledAnnotationContent,
} from "src/components/Viewer/InformationPanel/Annotation/Item.styled";

type Props = {
  annotationCollection: AnnotationCollectionNormalized;
};

const AnnotationCollectionPage: React.FC<Props> = ({
  annotationCollection,
}) => {
  const viewerState: ViewerContextStore = useViewerState();
  const viewerDispatch = useViewerDispatch();
  const {
    activeAnnotationId,
    activeManifest,
    openSeadragonViewer,
    vault,
    visibleCanvases,
  } = viewerState;

  const [, setLoadedManifests] = useState(0);

  useEffect(() => {
    const manifestIds = new Set<string>();
    for (const page of annotationCollection.pages) {
      for (const annotation of page.items ?? []) {
        const { manifest } = getManifestFromAnnotationTarget(annotation.target);
        if (manifest) manifestIds.add(manifest);
      }
    }

    manifestIds.forEach((manifestId) => {
      vault.load(manifestId).then(() => {
        setLoadedManifests((n) => n + 1);
      }).catch(() => {});
    });
  }, [annotationCollection]);

  if (!annotationCollection?.pages?.length) return <></>;

  function getSelector(annotation: AnnotationRaw) {
    const { target } = annotation;
    if (!target || typeof target === "string") return null;
    return (target as any).selector ?? null;
  }

  function getThumbnail(annotation: AnnotationRaw): string | undefined {
    const { canvas: canvasId } = getManifestFromAnnotationTarget(
      annotation.target,
    );
    if (!canvasId) return undefined;

    const painting = getPaintingResource(vault, canvasId) as any;
    const targetResource = painting?.[0]?.service
      ? painting?.[0]?.service[0]?.id || painting?.[0]?.service[0]?.["@id"]
      : undefined;
    if (!targetResource) return undefined;

    const selector = getSelector(annotation);
    const xywh = selector?.value?.split("=")[1] || "full";
    const [w, h] = xywh !== "full" ? xywh.split(",").slice(2) : [100, 100];

    const maxSize = 100;
    const ratio = Math.max(Number(w), Number(h));
    const size = [
      Math.round((Number(w) / ratio) * maxSize),
      Math.round((Number(h) / ratio) * maxSize),
    ].join(",");

    return `${targetResource}/${xywh}/!${size}/0/default.jpg`;
  }

  function handleAnnotationClick(annotation: AnnotationRaw) {
    const { manifest, canvas: canvasId } = getManifestFromAnnotationTarget(
      annotation.target,
    );

    if (!canvasId) return;

    const isVisible = visibleCanvases.map((c) => c.id).includes(canvasId);

    viewerDispatch({
      type: "updateActiveAnnotationId",
      activeAnnotationId: annotation.id,
    });

    if (isVisible) {
      if (openSeadragonViewer)
        zoomToOverlay(openSeadragonViewer, annotation.id);
      return;
    }

    // Canvas not yet visible — defer highlight until OSD draws the overlay.
    viewerDispatch({
      type: "updatePendingAnnotationTarget",
      pendingAnnotationTarget: { canvasId, annotationId: annotation.id },
    });

    // Pre-set canvas before manifest dispatch so the manifest loader lands on
    // the annotation's canvas rather than the manifest's first canvas.
    viewerDispatch({ type: "updateActiveCanvas", canvasId });

    if (manifest && manifest !== activeManifest) {
      viewerDispatch({ type: "updateActiveManifest", manifestId: manifest });
    }
  }

  return (
    <>
      {annotationCollection.pages.map((page, pageIndex) => (
        <Group key={page.id} data-testid="annotation-collection-page">
          {annotationCollection.pages.length > 1 && (
            <header>
              {annotationCollection.label ? (
                <Label label={annotationCollection.label} />
              ) : null}
              <em>
                {pageIndex + 1} / {annotationCollection.pages.length}
              </em>
            </header>
          )}
          {annotationCollection.pages.length === 1 &&
            annotationCollection.label && (
              <header>
                <Label label={annotationCollection.label} />
              </header>
            )}
          <div data-testid="annotation-collection-page-items">
            {(page.items ?? []).map((annotation) => {
              const bodyText = getAnnotationBodyText(annotation);
              const motivation = Array.isArray(annotation.motivation)
                ? annotation.motivation.join(", ")
                : annotation.motivation;
              const thumbnail = getThumbnail(annotation);

              const isActive = activeAnnotationId === annotation.id;

              return (
                <Item
                  key={annotation.id}
                  data-format="text/plain"
                  data-content={bodyText}
                  data-active={isActive ? "true" : undefined}
                  className="clover-iiif-annotation-item"
                  title={motivation}
                >
                  <span
                    style={
                      thumbnail
                        ? {
                            backgroundImage: `url(${thumbnail})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  ></span>
                  <ButtonStyled
                    onClick={() => handleAnnotationClick(annotation)}
                  >
                    <StyledAnnotationContent>
                      {bodyText}
                    </StyledAnnotationContent>
                  </ButtonStyled>
                </Item>
              );
            })}
          </div>
        </Group>
      ))}
    </>
  );
};

export default AnnotationCollectionPage;
