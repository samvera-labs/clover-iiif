import {
  AnnotationPageNormalized,
  Canvas,
  IIIFExternalWebResource,
} from "@iiif/presentation-3";
import { AnnotationResource, AnnotationResources } from "src/types/annotations";

import { Icon } from "src/components/UI";
import InformationPanel from "src/components/Viewer/InformationPanel/InformationPanel";
import Media from "src/components/Viewer/Media/Media";
import Painting from "../Painting/Painting";
import React, { useRef, useState } from "react";
import { useViewerDispatch, useViewerState } from "src/context/viewer-context";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import { setupPlugins } from "src/lib/plugin-helpers";

export interface ViewerContentProps {
  activeCanvas: string;
  /** Full screen moves the thumbnail rail out from beside the information panel. */
  isFullscreen?: boolean;
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
  isFullscreen = false,
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
    plugins,
    sequence,
    visibleCanvases,
  } = useViewerState();
  const dispatch = useViewerDispatch();
  const { informationPanel } = configOptions;
  const { t } = useCloverTranslation();

  /*
   * No full-page tracking here any more.
   *
   * This used to watch OpenSeadragon's `full-page` event, hold the reader's intent in a ref
   * so a rebuilt viewer could re-enter, and portal the thumbnail rail to `<body>` so it
   * survived — all of it working around `setFullPage()` hiding every other child of the
   * body. Clover full-screens its own root instead, so the rail (and the header, the
   * controls, the information panel) never leaves the tree and there is nothing to track.
   * See `src/lib/fullscreen.ts`.
   */

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
  const hasContentSearch =
    informationPanel?.renderContentSearch && contentSearchResource;
  const hasPluginInformationPanel =
    setupPlugins(plugins).pluginsWithInfoPanel.length > 0;
  const hasInformationPanelContent =
    informationPanel?.renderAbout ||
    (informationPanel?.renderAnnotation && hasAnnotations) ||
    hasContentSearch ||
    hasPluginInformationPanel;

  const isAside = Boolean(isInformationOpen && hasInformationPanelContent);

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

  const hasRail = sequence[1].length > 1;

  const rail = (
    <div className="clover-viewer-media-wrapper">
      <Media items={items} activeItem={0} />
    </div>
  );

  /*
   * In full screen the rail leaves `Main` and becomes a sibling of the whole row.
   *
   * `Content` lays the painting and the information panel out side by side, so a rail inside
   * `Main` is only ever as wide as the painting — it stops where the panel starts. Full screen
   * wants it across the whole bottom, under both, which means it has to sit outside the row
   * rather than in one of its columns.
   */
  return (
    <>
      <div
        ref={contentRef}
        className="clover-viewer-content"
        data-testid="clover-viewer-content"
      >
        <div
          className="clover-viewer-main"
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

          {hasRail && !isFullscreen && rail}

          {renderToggle &&
            (CustomToggle ? (
              <span
                className="clover-viewer-custom-panel-toggle"
                data-aside-active={isAside}
              >
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
              </span>
            ) : (
              <button
                className="clover-viewer-panel-toggle"
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
              </button>
            ))}
        </div>
        {isAside && (
          <>
            <div
              className="clover-viewer-drag-handle"
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              data-dragging={dragging.current}
              aria-hidden="true"
            />
            <aside
              className="clover-viewer-aside"
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
            </aside>
          </>
        )}
      </div>
      {hasRail && isFullscreen && rail}
    </>
  );
};

export default ViewerContent;
