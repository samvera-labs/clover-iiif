import {
  List,
  Scroll,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React from "react";
import {
  useViewerDispatch,
  useViewerState,
  type PluginConfig,
} from "src/context/viewer-context";
import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import {
  AnnotationPageNormalized,
  CanvasNormalized,
} from "@iiif/presentation-3";
import { annotationTargetsCanvas } from "src/lib/information-panel-helpers";
import { useTabSelection } from "./hooks/useTabSelection";
import { TabList } from "./components/TabList";
import { TabContent } from "./components/TabContent";
import { PluginTabContent } from "./components/PluginTabContent";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const UserScrollTimeout = 1500;

interface InformationPanelProps {
  activeCanvas: string;
  availableTabs: string[];
  filteredAnnotationResources: AnnotationResources;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  contentSearchResource?: AnnotationResource;
  contentSearchCallback?: (query: string) => void;
  initialSearchQuery?: string;
  pluginsWithInfoPanel?: PluginConfig[];
}

export const InformationPanel: React.FC<InformationPanelProps> = ({
  activeCanvas,
  availableTabs,
  filteredAnnotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
  contentSearchCallback,
  initialSearchQuery,
  pluginsWithInfoPanel,
}) => {
  const dispatch: any = useViewerDispatch();
  const viewerState = useViewerState();
  const {
    annotationCollection,
    contentStateAnnotation,
    informationPanelResource,
    isAutoScrolling,
    isUserScrolling,
    vault,
    configOptions,
    visibleCanvases,
  } = viewerState;
  const { informationPanel } = configOptions;
  const { t } = useCloverTranslation();
  const userScrollTimeoutRef = React.useRef<number | undefined>(
    isUserScrolling,
  );
  const userIsScrollingRef = React.useRef(Boolean(isUserScrolling));

  const canvas = vault.get({
    id: activeCanvas,
    type: "Canvas",
  }) as CanvasNormalized;
  const panelCanvasIds = React.useMemo(() => {
    const visibleCanvasIds =
      visibleCanvases?.map((visibleCanvas) => visibleCanvas.id) ?? [];
    return visibleCanvasIds.length > 0 ? visibleCanvasIds : [activeCanvas];
  }, [activeCanvas, visibleCanvases]);
  const hasContentStateAnnotation = panelCanvasIds.some((canvasId) =>
    annotationTargetsCanvas(contentStateAnnotation, canvasId),
  );
  const hasAnnotationCollection = Boolean(annotationCollection?.pages?.length);

  const handleValueChange = useTabSelection({
    availableTabs,
    informationPanelResource,
    configDefaultTab: informationPanel?.defaultTab,
    dispatch,
  });

  const handleClose = () => {
    dispatch({ type: "updateInformationOpen", isInformationOpen: false });
  };

  const handleScroll = () => {
    if (isAutoScrolling) return;

    clearTimeout(userScrollTimeoutRef.current);
    const timeout = window.setTimeout(() => {
      userScrollTimeoutRef.current = undefined;
      userIsScrollingRef.current = false;
      dispatch({ type: "updateUserScrolling", isUserScrolling: undefined });
    }, UserScrollTimeout);
    userScrollTimeoutRef.current = timeout;

    if (!userIsScrollingRef.current) {
      userIsScrollingRef.current = true;
      dispatch({ type: "updateUserScrolling", isUserScrolling: timeout });
    }
  };

  return (
    <Wrapper
      data-testid="information-panel"
      defaultValue={informationPanelResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={informationPanelResource}
      className="clover-viewer-information-panel"
    >
      <List
        aria-label={t("informationPanelTabs")}
        data-testid="information-panel-list"
      >
        <TabList
          renderToggle={informationPanel?.renderToggle}
          availableTabs={availableTabs}
          annotationTabLabel={informationPanel?.annotationTabLabel}
          pluginsWithInfoPanel={pluginsWithInfoPanel}
          onClose={handleClose}
        />
      </List>
      <Scroll handleScroll={handleScroll}>
        <TabContent
          availableTabs={availableTabs}
          contentSearchResource={contentSearchResource}
          searchServiceUrl={searchServiceUrl}
          setContentSearchResource={setContentSearchResource}
          activeCanvas={activeCanvas}
          contentSearchCallback={contentSearchCallback}
          initialSearchQuery={initialSearchQuery}
          contentStateAnnotation={contentStateAnnotation}
          hasContentStateAnnotation={hasContentStateAnnotation}
          filteredAnnotationResources={filteredAnnotationResources}
          hasAnnotationCollection={hasAnnotationCollection}
          annotationCollection={annotationCollection}
        />
        {pluginsWithInfoPanel && (
          <PluginTabContent plugins={pluginsWithInfoPanel} canvas={canvas} />
        )}
      </Scroll>
    </Wrapper>
  );
};

export default InformationPanel;
