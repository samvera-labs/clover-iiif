import {
  AnnotationPageNormalized,
  Canvas,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import { AnnotationResource, AnnotationResources } from "src/types/annotations";
import {
  Aside,
  Content,
  CustomPanelToggle,
  DragHandle,
  Main,
  MediaWrapper,
  PanelToggle,
} from "src/components/Viewer/Viewer/Viewer.styled";

import { Icon } from "src/components/UI";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

export interface ViewerContentProps {
  activeCanvas: string;
  annotationResources: AnnotationResources;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  contentSearchResource?: AnnotationResource;
  contentSearchCallback?: (query: string) => void;
  initialSearchQuery?: string;
  painting: IIIFExternalWebResource[];
  items: Canvas[];
  isAudioVideo: boolean;
}

const ViewerContent: React.FC<ViewerContentProps> = ({
  activeCanvas,
  annotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
  contentSearchCallback,
  initialSearchQuery,
  isAudioVideo,
  items,
  painting,
}) => {
  const {
    contentStateAnnotation,
    isInformationOpen,
    configOptions,
    openSeadragonViewer,
    sequence,
    visibleCanvases,
  } = useViewerState();
  const dispatch = useViewerDispatch();
  const { informationPanel } = configOptions;
  const { t } = useCloverTranslation();

  /*
   * Whether OpenSeadragon has taken over the window.
   *
   * Going full page is not a CSS change — OpenSeadragon sets `display: none` on every
   * direct child of `<body>` except its own element, then reparents that element to
   * `<body>`. The thumbnail strip lives inside the tree that just got hidden, so it
   * disappears along with the rest of the page. Tracking the state lets us re-home the
   * strip somewhere that survives (see the portal below).
   *
   * `full-page` fires for both directions, carrying `fullPage`.
   */
  const [isFullPage, setIsFullPage] = useState(false);
  /*
   * The reader's *intent*, held separately from the observed state.
   *
   * Painting keys its OpenSeadragon instance on the active canvas, so selecting a
   * thumbnail tears the viewer down and builds a new one that has never been full page.
   * Without remembering the intent, navigating would silently drop the reader back to
   * the inline layout — the strip would work exactly once.
   */
  const wantsFullPage = useRef(false);

  useEffect(() => {
    if (!openSeadragonViewer) return;

    const handleFullPage = ({ fullPage }: { fullPage: boolean }) => {
      wantsFullPage.current = Boolean(fullPage);
      setIsFullPage(Boolean(fullPage));
    };
    openSeadragonViewer.addHandler("full-page", handleFullPage);

    /*
     * Restore full page on a viewer built while the reader was already in it. Deferred a
     * frame: OpenSeadragon measures the container as it goes full page, and this runs
     * during the same commit that inserted the element.
     */
    let raf = 0;
    if (wantsFullPage.current && !openSeadragonViewer.isFullPage()) {
      raf = requestAnimationFrame(() => {
        if (wantsFullPage.current) openSeadragonViewer.setFullPage(true);
      });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      openSeadragonViewer.removeHandler("full-page", handleFullPage);
      /*
       * Leaving full page before this viewer goes away is not optional.
       * `Viewer.destroy()` does not undo it — only `setFullPage(false)` restores the
       * `display: none` OpenSeadragon wrote onto every other child of `<body>`. Skip
       * this and navigating away mid-full-page leaves the whole page blank.
       */
      if (openSeadragonViewer.isFullPage()) {
        openSeadragonViewer.setFullPage(false);
      }
    };
  }, [openSeadragonViewer]);

  const contentRef = useRef<HTMLDivElement>(null);
  const [asideWidth, setAsideWidth] = useState<number | null>(null);
  const dragging = useRef(false);

  /**
   * The information panel should be rendered if toggled true and if
   * there is content (About or Annotations Resources) to display.
   */
  const visibleCanvasesIds = visibleCanvases.map((canvas) => canvas.id);

  const hasAnnotations =
    annotationResources.length > 0 ||
    // @ts-ignore
    visibleCanvasesIds.includes(contentStateAnnotation?.target?.source?.id);

  // Only force the aside open for annotations when no toggle is rendered.
  // If a toggle is visible, it must control open/close behavior.
  const isForcedAside =
    hasAnnotations &&
    informationPanel?.renderAnnotation &&
    informationPanel?.renderToggle === false &&
    isInformationOpen;

  const isAside =
    (informationPanel?.renderAbout && isInformationOpen) || isForcedAside;

  const renderToggle = informationPanel?.renderToggle;
  const CustomToggle = informationPanel?.toggleComponent;

  const handleToggle = () => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: !isInformationOpen,
    });
  };

  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!dragging.current || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const pct = ((rect.right - e.clientX) / rect.width) * 100;
    setAsideWidth(Math.min(60, Math.max(20, pct)));
  };

  const handleDragEnd = () => {
    dragging.current = false;
  };

  const mainStyle =
    asideWidth !== null && isAside
      ? { width: `${100 - asideWidth}%` }
      : undefined;

  const asideStyle =
    asideWidth !== null && isAside ? { width: `${asideWidth}%` } : undefined;

  return (
    <Content
      ref={contentRef}
      className="clover-viewer-content"
      data-testid="clover-viewer-content"
    >
      <Main
        data-aside-active={isAside}
        data-aside-toggle={renderToggle}
        style={mainStyle}
      >
        <Painting
          activeCanvas={activeCanvas}
          annotationResources={annotationResources}
          contentSearchResource={contentSearchResource}
          isMedia={isAudioVideo}
          painting={painting}
        />

        {sequence[1].length > 1 && !isFullPage && (
          <MediaWrapper className="clover-viewer-media-wrapper">
            <Media items={items} activeItem={0} />
          </MediaWrapper>
        )}

        {renderToggle &&
          (CustomToggle ? (
            <CustomPanelToggle data-aside-active={isAside}>
              <CustomToggle
                buttonProps={{
                  type: "button",
                  "aria-label": t("informationPanelToggle"),
                  "aria-expanded": isInformationOpen,
                  onClick: handleToggle,
                }}
                icon={
                  <Icon fill="currentColor" aria-hidden="true">
                    {isInformationOpen ? (
                      <Icon.PanelExpand />
                    ) : (
                      <Icon.PanelCollapse />
                    )}
                  </Icon>
                }
                isOpen={isInformationOpen}
                label={t("informationPanelToggle")}
              />
            </CustomPanelToggle>
          ) : (
            <PanelToggle
              data-aside-active={isAside}
              onClick={handleToggle}
              aria-label={t("informationPanelToggle")}
              aria-expanded={isInformationOpen}
            >
              <Icon fill="currentColor" aria-hidden="true">
                {isInformationOpen ? (
                  <Icon.PanelExpand />
                ) : (
                  <Icon.PanelCollapse />
                )}
              </Icon>
            </PanelToggle>
          ))}
      </Main>
      {isAside && (
        <>
          <DragHandle
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            data-dragging={dragging.current}
            aria-hidden="true"
          />
          <Aside
            data-aside-active={isAside}
            data-aside-toggle={renderToggle}
            style={asideStyle}
          >
            <InformationPanel
              activeCanvas={activeCanvas}
              annotationResources={annotationResources}
              searchServiceUrl={searchServiceUrl}
              setContentSearchResource={setContentSearchResource}
              contentSearchResource={contentSearchResource}
              contentSearchCallback={contentSearchCallback}
              initialSearchQuery={initialSearchQuery}
            />
          </Aside>
        </>
      )}

      {/*
       * The thumbnail strip while OpenSeadragon owns the window, floated over the image
       * so items stay navigable.
       *
       * Portalled to `document.body` rather than into the viewer's element, for two
       * reasons. OpenSeadragon hides the body children that exist at the moment it goes
       * full page, so a node appended afterwards is never hidden — being a late sibling
       * is what keeps this visible. And the viewer's element is rebuilt whenever the
       * canvas changes, which would take the strip down with it mid-navigation; body
       * outlives that.
       */}
      {sequence[1].length > 1 &&
        isFullPage &&
        typeof document !== "undefined" &&
        createPortal(
          <MediaWrapper
            className="clover-viewer-media-wrapper"
            data-fullpage="true"
          >
            <Media items={items} activeItem={0} />
          </MediaWrapper>,
          document.body,
        )}
    </Content>
  );
};

export default ViewerContent;
