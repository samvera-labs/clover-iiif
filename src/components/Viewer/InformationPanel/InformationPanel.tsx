import * as Tabs from "@radix-ui/react-tabs";
import React, { useEffect, useMemo } from "react";
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
import { Label } from "src/components/Primitives";
import { setupPlugins } from "src/lib/plugin-helpers";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";

import { ErrorBoundary } from "react-error-boundary";
import { useCloverTranslation } from "src/i18n/useCloverTranslation";
import ContentStateAnnotationPage from "./ContentState/Page";
import { annotationMatchesMotivations } from "src/lib/annotation-helpers";
import {
  infoPanelContent,
  infoPanelList,
  infoPanelRoot,
  infoPanelScroll,
  infoPanelTrigger,
} from "./InformationPanel.css";

const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

interface NavigatorProps {
  activeCanvas: string;
  annotationResources?: AnnotationResources;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  contentSearchResource?: AnnotationResource;
}

export const InformationPanel: React.FC<NavigatorProps> = ({
  activeCanvas,
  annotationResources,
  searchServiceUrl,
  setContentSearchResource,
  contentSearchResource,
}) => {
  const { t } = useCloverTranslation();
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
    contentStateAnnotation,
    informationPanelResource,
    isAutoScrolling,
    isUserScrolling,
    vault,
    configOptions,
    plugins,
  } = viewerState;
  const { informationPanel } = configOptions;

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;
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
    Boolean(filteredAnnotationResources?.length) || hasContentStateAnnotation;

  const { pluginsWithInfoPanel } = setupPlugins(plugins);

  function renderPluginInformationPanel(plugin: PluginConfig, i: number) {
    const PluginInformationPanelComponent = plugin?.informationPanel
      ?.component as unknown as React.ElementType;

    if (PluginInformationPanelComponent === undefined) {
      return <></>;
    }

    return (
      <Tabs.Content
        className={infoPanelContent}
        key={i}
        value={plugin.id}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PluginInformationPanelComponent
            {...plugin?.informationPanel?.componentProps}
            canvas={canvas}
            useViewerDispatch={useViewerDispatch}
            useViewerState={useViewerState}
          />
        </ErrorBoundary>
      </Tabs.Content>
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
    /**
     * If a default tab is set, set the active tab to that value
     */
    if (
      [
        "manifest-about",
        "manifest-annotations",
        "manifest-content-search",
      ].includes(String(informationPanel?.defaultTab))
    ) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: informationPanel?.defaultTab,
      });
    } else if (hasContentStateAnnotation) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-annotations",
      });
    } else {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-about",
      });
    }
  }, []);

  useEffect(() => {
    if (!hasAnnotations) {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-about",
      });
    }
  }, [hasAnnotations]);

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
    <Tabs.Root
      className={`${infoPanelRoot} clover-viewer-information-panel`}
      data-testid="information-panel"
      defaultValue={informationPanelResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={informationPanelResource}
    >
      <Tabs.List
        aria-label={t("informationPanelTabs")}
        className={infoPanelList}
        data-testid="information-panel-list"
      >
        {renderToggle && (
          <Tabs.Trigger
            className={infoPanelTrigger}
            data-value="manifest-back"
            onClick={handleInformationPanelClose}
            value="manifest-back"
          >
            {t("informationPanelTabsClose")}
          </Tabs.Trigger>
        )}
        {renderAbout && (
          <Tabs.Trigger className={infoPanelTrigger} value="manifest-about">
            {t("informationPanelTabsAbout")}
          </Tabs.Trigger>
        )}
        {renderContentSearch && contentSearchResource && (
          <Tabs.Trigger
            className={infoPanelTrigger}
            value="manifest-content-search"
          >
            {t("informationPanelTabsSearch")}
          </Tabs.Trigger>
        )}
        {renderAnnotation && hasAnnotations && (
          <Tabs.Trigger
            className={infoPanelTrigger}
            value="manifest-annotations"
          >
            {informationPanel?.annotationTabLabel ||
              t("informationPanelTabsAnnotations")}
          </Tabs.Trigger>
        )}

        {pluginsWithInfoPanel?.map((plugin, i) => (
          <Tabs.Trigger className={infoPanelTrigger} key={i} value={plugin.id}>
            <Label label={plugin.informationPanel?.label as InternationalString} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className={infoPanelScroll} onScroll={handleScroll}>
        {renderAbout && (
          <Tabs.Content className={infoPanelContent} value="manifest-about">
            <Information />
          </Tabs.Content>
        )}
        {renderContentSearch && contentSearchResource && (
          <Tabs.Content
            className={infoPanelContent}
            value="manifest-content-search"
          >
            <ContentSearch
              searchServiceUrl={searchServiceUrl}
              setContentSearchResource={setContentSearchResource}
              activeCanvas={activeCanvas}
              annotationPage={contentSearchResource}
            />
          </Tabs.Content>
        )}
        {renderAnnotation && hasAnnotations && filteredAnnotationResources && (
          <Tabs.Content
            className={infoPanelContent}
            value="manifest-annotations"
          >
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
          </Tabs.Content>
        )}

        {pluginsWithInfoPanel?.map((plugin, i) =>
          renderPluginInformationPanel(plugin, i),
        )}
      </div>
    </Tabs.Root>
  );
};

export default InformationPanel;
