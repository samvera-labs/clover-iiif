import {
  Content,
  List,
  Scroll,
  Trigger,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React, { useEffect, useMemo, useRef } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
  type PluginConfig,
} from "src/context/viewer-context";

import AnnotationPage from "src/components/Viewer/InformationPanel/Annotation/Page";
import ContentSearch from "src/components/Viewer/InformationPanel/ContentSearch/ContentSearch";
import { AnnotationResources, AnnotationResource } from "src/types/annotations";
import Information from "src/components/Viewer/InformationPanel/About/About";
import {
  InternationalString,
  AnnotationPageNormalized,
  CanvasNormalized,
  AnnotationNormalized,
} from "@iiif/presentation-3";
import { Icon } from "src/components/UI";
import { Label } from "src/components/Primitives";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";

import { ErrorBoundary } from "react-error-boundary";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import ContentStateAnnotationPage from "./ContentState/Page";
import AnnotationCollectionPage from "./AnnotationCollection/Page";
import { annotationMatchesMotivations } from "src/lib/annotation-helpers";
import { getAvailableTabs } from "src/lib/information-panel-helpers";

const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

interface NavigatorProps {
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

export const InformationPanel: React.FC<NavigatorProps> = ({
  activeCanvas,
  annotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
  contentSearchCallback,
  initialSearchQuery,
  pluginsWithInfoPanel,
}) => {
  const { t } = useCloverTranslation();
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    annotationCollection,
    contentStateAnnotation,
    informationPanelResource,
    isAutoScrolling,
    isUserScrolling,
    vault,
    configOptions,
  } = viewerState;
  const { informationPanel } = configOptions;

  const hasInitializedRef = useRef(false);

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;
  const hasAnnotationCollection = Boolean(annotationCollection?.pages?.length);
  const canvas = vault.get({
    id: activeCanvas,
    type: "Canvas",
  }) as CanvasNormalized;

  const renderContentSearch = informationPanel?.renderContentSearch;
  const renderToggle = informationPanel?.renderToggle;
  const allowedAnnotationMotivations = configOptions?.annotations?.motivations;
  const contentStateAnnotationSource =
    // @ts-ignore
    contentStateAnnotation?.target?.source || contentStateAnnotation?.target;
  const hasContentStateAnnotation =
    Boolean(contentStateAnnotation) &&
    // @ts-ignore
    contentStateAnnotationSource.id === activeCanvas;
  const filteredAnnotationResources = useMemo(() => {
    if (!annotationResources) return [];
    if (!allowedAnnotationMotivations)
      return annotationResources;

    return annotationResources
      .map((annotationPage) => {
        if (!annotationPage?.items?.length) return null;

        const filteredItems = annotationPage.items.filter((item) => {
          const annotation = vault.get(item.id) as
            | AnnotationNormalized
            | undefined;
          return annotationMatchesMotivations(
            annotation,
            allowedAnnotationMotivations,
          );
        });

        if (!filteredItems.length) return null;

        return {
          ...annotationPage,
          items: filteredItems,
        };
      })
      .filter(Boolean) as AnnotationResources;
  }, [annotationResources, allowedAnnotationMotivations, vault]);
  const hasAnnotations =
    Boolean(filteredAnnotationResources?.length) ||
    hasContentStateAnnotation ||
    hasAnnotationCollection;

  function renderPluginInformationPanel(plugin: PluginConfig, i: number) {
    const PluginInformationPanelComponent = plugin?.informationPanel
      ?.component as unknown as React.ElementType;

    if (PluginInformationPanelComponent === undefined) {
      return <></>;
    }

    return (
      <Content key={i} value={plugin.id}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PluginInformationPanelComponent
            {...plugin?.informationPanel?.componentProps}
            canvas={canvas}
            useViewerDispatch={useViewerDispatch}
            useViewerState={useViewerState}
          />
        </ErrorBoundary>
      </Content>
    );
  }

  /**
   * Close the information panel
   */
  const handleInformationPanelClose = () => {
    dispatch({
      type: "updateInformationOpen",
      isInformationOpen: false,
    });
  };

  useEffect(() => {
    const availableTabs = getAvailableTabs({
      informationPanel,
      annotationResources,
      contentSearchResource,
      pluginsWithInfoPanel,
      contentStateAnnotation,
      annotationCollection,
    });

    if (!hasInitializedRef.current) {
      // First run — set the initial default tab based on config
      hasInitializedRef.current = true;
      const defaultTab =
        (informationPanel?.defaultTab &&
          availableTabs.includes(String(informationPanel.defaultTab)) &&
          informationPanel.defaultTab) ||
        availableTabs[0] ||
        "manifest-about";

      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: defaultTab,
      });
      return;
    }

    // Subsequent runs — preserve the current tab selection if it's still available
    if (availableTabs.includes(informationPanelResource)) {
      return;
    }

    // Current tab is no longer available — select the best alternative
    const defaultTab =
      (informationPanel?.defaultTab &&
        availableTabs.includes(String(informationPanel.defaultTab)) &&
        informationPanel.defaultTab) ||
      availableTabs[0] ||
      "manifest-about";

    dispatch({
      type: "updateInformationPanelResource",
      informationPanelResource: defaultTab,
    });
  }, [
    informationPanel,
    annotationResources,
    contentSearchResource,
    pluginsWithInfoPanel,
    contentStateAnnotation,
    annotationCollection,
    informationPanelResource,
    dispatch,
  ]);

  function handleScroll() {
    if (!isAutoScrolling) {
      clearTimeout(isUserScrolling);
      const timeout = setTimeout(() => {
        dispatch({
          type: "updateUserScrolling",
          isUserScrolling: undefined,
        });
      }, UserScrollTimeout);

      dispatch({
        type: "updateUserScrolling",
        isUserScrolling: timeout,
      });
    }
  }

  const handleValueChange = (value: string) => {
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
        {renderToggle && (
          <Trigger
            value="manifest-back"
            data-value="manifest-back"
            onClick={handleInformationPanelClose}
            as={"button"}
            aria-label={t("informationPanelTabsClose")}
          >
            <Icon fill="currentColor" aria-hidden="true">
              <Icon.PanelExpand />
            </Icon>
          </Trigger>
        )}
        {renderAbout && (
          <Trigger value="manifest-about">
            {t("informationPanelTabsAbout")}
          </Trigger>
        )}
        {renderContentSearch && contentSearchResource && (
          <Trigger value="manifest-content-search">
            {t("informationPanelTabsSearch")}
          </Trigger>
        )}
        {renderAnnotation && hasAnnotations && (
          <Trigger value="manifest-annotations">
            {informationPanel?.annotationTabLabel ||
              t("informationPanelTabsAnnotations")}
          </Trigger>
        )}
        {pluginsWithInfoPanel &&
          pluginsWithInfoPanel.map((plugin, i) => (
            <Trigger key={i} value={plugin.id}>
              <Label
                label={plugin.informationPanel?.label as InternationalString}
              />
            </Trigger>
          ))}
      </List>
      <Scroll handleScroll={handleScroll}>
        {renderAbout && (
          <Content value="manifest-about">
            <Information />
          </Content>
        )}
        {renderContentSearch && contentSearchResource && (
          <Content value="manifest-content-search">
            <ContentSearch
              searchServiceUrl={searchServiceUrl}
              setContentSearchResource={setContentSearchResource}
              activeCanvas={activeCanvas}
              annotationPage={contentSearchResource}
              contentSearchCallback={contentSearchCallback}
              initialSearchQuery={initialSearchQuery}
            />
          </Content>
        )}
        {renderAnnotation && hasAnnotations && (
          <Content value="manifest-annotations">
            {contentStateAnnotation && hasContentStateAnnotation && (
              <ContentStateAnnotationPage
                contentStateAnnotation={contentStateAnnotation}
              />
            )}
            {filteredAnnotationResources.map((annotationPage) => (
              <AnnotationPage
                key={annotationPage.id}
                annotationPage={annotationPage}
              />
            ))}
            {hasAnnotationCollection && (
              <AnnotationCollectionPage annotationCollection={annotationCollection!} />
            )}
          </Content>
        )}

        {pluginsWithInfoPanel &&
          pluginsWithInfoPanel.map((plugin, i) =>
            renderPluginInformationPanel(plugin, i),
          )}
      </Scroll>
    </Wrapper>
  );
};

export default InformationPanel;
