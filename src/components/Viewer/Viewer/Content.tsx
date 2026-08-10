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
import React, { useRef, useState } from "react";
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
    sequence,
    visibleCanvases,
  } = useViewerState();
  const dispatch = useViewerDispatch();
  const { informationPanel } = configOptions;
  const { t } = useCloverTranslation();

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

        {sequence[1].length > 1 && (
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
    </Content>
  );
};

export default ViewerContent;
