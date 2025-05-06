import {
  Content,
  List,
  Scroll,
  Trigger,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React, { useEffect } from "react";
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
} from "@iiif/presentation-3";
import { Label } from "src/components/Primitives";
import { setupPlugins } from "src/lib/plugin-helpers";
import ErrorFallback from "src/components/UI/ErrorFallback/ErrorFallback";

import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const dispatch: any = useViewerDispatch();
  const viewerState: ViewerContextStore = useViewerState();
  const {
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
  const hasAnnotations = Boolean(annotationResources?.length);

  const { pluginsWithInfoPanel } = setupPlugins(plugins);

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
    } else {
      dispatch({
        type: "updateInformationPanelResource",
        informationPanelResource: "manifest-about",
      });
    }
  }, []);

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
          >
            {t("informationPanelTabsClose")}
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
            {t("informationPanelTabsAnnotations")}
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
            />
          </Content>
        )}
        {renderAnnotation && annotationResources && (
          <Content value="manifest-annotations">
            {annotationResources.map((annotationPage) => (
              <AnnotationPage
                key={annotationPage.id}
                annotationPage={annotationPage}
              />
            ))}
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
