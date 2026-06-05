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
import { useFilteredAnnotations } from "./hooks/useFilteredAnnotations";
import { useAvailableTabs } from "./hooks/useAvailableTabs";
import { useTabSelection } from "./hooks/useTabSelection";
import { TabList } from "./components/TabList";
import { TabContent } from "./components/TabContent";
import { PluginTabContent } from "./components/PluginTabContent";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";

const UserScrollTimeout = 1500;

interface InformationPanelProps {
  activeCanvas: string;
  annotationResources?: AnnotationResources;
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
  annotationResources,
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

  // Hook: filter annotations by motivation
  const filteredAnnotationResources = useFilteredAnnotations({
    annotationResources,
    allowedMotivations: configOptions?.annotations?.motivations,
    vault,
  });

  // Derived state
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
  const hasAnnotations =
    Boolean(filteredAnnotationResources?.length) ||
    hasContentStateAnnotation ||
    hasAnnotationCollection;

  // Hook: compute available tabs
  const availableTabs = useAvailableTabs({
    informationPanel,
    annotationResources,
    filteredAnnotationResources,
    contentSearchResource,
    pluginsWithInfoPanel,
    contentStateAnnotation,
    annotationCollection,
    activeCanvases: panelCanvasIds,
  });

  // Hook: manage tab selection
  const markUserSelection = useTabSelection({
    availableTabs,
    informationPanelResource,
    configDefaultTab: informationPanel?.defaultTab,
    dispatch,
  });

  // Handlers
  const handleClose = () => {
    dispatch({ type: "updateInformationOpen", isInformationOpen: false });
  };

  const handleScroll = () => {
    if (!isAutoScrolling) {
      clearTimeout(isUserScrolling);
      const timeout = setTimeout(() => {
        dispatch({ type: "updateUserScrolling", isUserScrolling: undefined });
      }, UserScrollTimeout);
      dispatch({ type: "updateUserScrolling", isUserScrolling: timeout });
    }
  };

  const handleValueChange = (value: string) => {
    markUserSelection();
    dispatch({
      type: "updateInformationPanelResource",
      informationPanelResource: value,
    });
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
          renderAbout={informationPanel?.renderAbout}
          renderContentSearch={informationPanel?.renderContentSearch}
          contentSearchResource={contentSearchResource}
          renderAnnotation={informationPanel?.renderAnnotation}
          hasAnnotations={hasAnnotations}
          annotationTabLabel={informationPanel?.annotationTabLabel}
          pluginsWithInfoPanel={pluginsWithInfoPanel}
          onClose={handleClose}
        />
      </List>
      <Scroll handleScroll={handleScroll}>
        <TabContent
          renderAbout={informationPanel?.renderAbout}
          renderContentSearch={informationPanel?.renderContentSearch}
          contentSearchResource={contentSearchResource}
          searchServiceUrl={searchServiceUrl}
          setContentSearchResource={setContentSearchResource}
          activeCanvas={activeCanvas}
          contentSearchCallback={contentSearchCallback}
          initialSearchQuery={initialSearchQuery}
          renderAnnotation={informationPanel?.renderAnnotation}
          hasAnnotations={hasAnnotations}
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
