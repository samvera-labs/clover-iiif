import {
  AnnotationPageNormalized,
  Canvas,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import { AnnotationResource, AnnotationResources } from "src/types/annotations";
import {
  Aside,
  Content,
  DragHandle,
  Main,
  MediaWrapper,
  PanelToggle,
} from "src/components/Viewer/Viewer/Viewer.styled";

import { Icon } from "src/components/UI";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React, { useMemo, useRef, useState } from "react";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { hasAnyPanel } from "src/lib/information-panel-helpers";
import { setupPlugins } from "src/lib/plugin-helpers";
import { useFilteredAnnotations } from "src/components/Viewer/InformationPanel/hooks/useFilteredAnnotations";

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
    plugins,
    annotationCollection,
    visibleCanvases,
    vault,
  } = useViewerState();
  const dispatch: any = useViewerDispatch();
  const { informationPanel } = configOptions;
  const { t } = useCloverTranslation();

  const contentRef = useRef<HTMLDivElement>(null);
  const [asideWidth, setAsideWidth] = useState<number | null>(null);
  const dragging = useRef(false);

  const { pluginsWithInfoPanel } = useMemo(
    () => setupPlugins(plugins),
    [plugins],
  );

  const visibleCanvasIds = visibleCanvases.map((canvas) => canvas.id);
  const panelCanvasIds =
    visibleCanvasIds.length > 0 ? visibleCanvasIds : [activeCanvas];
  const filteredAnnotationResources = useFilteredAnnotations({
    annotationResources,
    allowedMotivations: configOptions.annotations?.motivations,
    vault,
  });

  const hasPanel = hasAnyPanel({
    informationPanel,
    annotationResources,
    filteredAnnotationResources,
    contentSearchResource,
    pluginsWithInfoPanel,
    contentStateAnnotation,
    annotationCollection,
    activeCanvases: panelCanvasIds,
  });

  const isAside = hasPanel && isInformationOpen;

  const renderToggle = informationPanel?.renderToggle;

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

        {renderToggle && (
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
        )}
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
              pluginsWithInfoPanel={pluginsWithInfoPanel}
            />
          </Aside>
        </>
      )}
    </Content>
  );
};

export default ViewerContent;
