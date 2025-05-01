import {
  AccordionHeader,
  AccordionTrigger,
  AccordionRoot,
  AccordionItem,
  AccordionContent,
  AccordionChevron,
  Wrapper,
} from "src/components/Viewer/InformationPanel/InformationPanel.styled";
import React, { useEffect, useState } from "react";
import {
  ViewerContextStore,
  useViewerDispatch,
  useViewerState,
  type PluginConfig,
} from "src/context/viewer-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCircleInfo,
  faMagnifyingGlass,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faCircleInfo, faMagnifyingGlass, faList);

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

// const UserScrollTimeout = 1500; // 1500ms without a user-generated scroll event reverts to auto-scrolling

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
    // isAutoScrolling,
    // isUserScrolling,

    vault,
    configOptions,
    plugins,
  } = viewerState;
  const { informationPanel } = configOptions;

  const [activeResource, setActiveResource] = useState<string>();

  const renderAbout = informationPanel?.renderAbout;
  const renderAnnotation = informationPanel?.renderAnnotation;
  const canvas = vault.get({
    id: activeCanvas,
    type: "Canvas",
  }) as CanvasNormalized;

  const renderContentSearch = informationPanel?.renderContentSearch;
  const renderToggle = informationPanel?.renderToggle;

  /**
   * List of tabs to render in the information panel
   */
  const tabList = [
    ...(renderAbout ? ["manifest-about"] : []),
    ...(renderContentSearch && searchServiceUrl
      ? ["manifest-content-search"]
      : []),
    ...(renderAnnotation && annotationResources
      ? annotationResources.map((resource) => resource.id)
      : []),
  ];

  const { pluginsWithInfoPanel } = setupPlugins(plugins);

  function renderPluginInformationPanel(plugin: PluginConfig, i: number) {
    const PluginInformationPanelComponent = plugin?.informationPanel
      ?.component as unknown as React.ElementType;

    if (PluginInformationPanelComponent === undefined) {
      return <></>;
    }

    return (
      <AccordionContent key={i}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <PluginInformationPanelComponent
            {...plugin?.informationPanel?.componentProps}
            canvas={canvas}
            useViewerDispatch={useViewerDispatch}
            useViewerState={useViewerState}
          />
        </ErrorBoundary>
      </AccordionContent>
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
    if (informationPanel?.defaultTab) {
      switch (informationPanel?.defaultTab) {
        case "manifest-annotations":
          if (annotationResources && annotationResources?.length > 0)
            setActiveResource(annotationResources[0].id);
          break;
        case "manifest-content-search":
          setActiveResource("manifest-content-search");
          break;
        default:
          setActiveResource("manifest-about");
          break;
      }
    } else {
      /**
       * If no default tab is set, default to the first tab in the list
       */
      if (tabList && tabList.length > 0) setActiveResource(tabList[0]);
    }
  }, []);

  // function handleScroll() {
  //   if (!isAutoScrolling) {
  //     clearTimeout(isUserScrolling);
  //     const timeout = setTimeout(() => {
  //       dispatch({
  //         type: "updateUserScrolling",
  //         isUserScrolling: undefined,
  //       });
  //     }, UserScrollTimeout);

  //     dispatch({
  //       type: "updateUserScrolling",
  //       isUserScrolling: timeout,
  //     });
  //   }
  // }

  const handleValueChange = (value: string) => {
    setActiveResource(value);
  };

  return (
    <Wrapper
      data-testid="information-panel"
      defaultValue={activeResource}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={activeResource}
      className="clover-viewer-information-panel"
    >
      {
        <AccordionRoot type="single" defaultValue="manifest-about" collapsible>
          {!renderToggle && (
            <AccordionItem value="manifest-back">
              <AccordionHeader>
                <AccordionTrigger
                  onClick={handleInformationPanelClose}
                  as={"button"}
                >
                  <FontAwesomeIcon icon={faEye} />
                  {t("informationPanelTabsClose")}
                </AccordionTrigger>
              </AccordionHeader>
            </AccordionItem>
          )}

          {renderAbout && (
            <AccordionItem value="manifest-about">
              <AccordionHeader>
                <AccordionTrigger value="manifest-about">
                  <FontAwesomeIcon icon={faCircleInfo} />
                  {t("informationPanelTabsAbout")}
                  <AccordionChevron className="AccordionChevron" aria-hidden />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Information />
              </AccordionContent>
            </AccordionItem>
          )}

          {renderContentSearch && contentSearchResource && (
            <AccordionItem value="manifest-content-search">
              <AccordionHeader>
                <AccordionTrigger>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <Label
                    label={contentSearchResource.label as InternationalString}
                  />
                  <AccordionChevron className="AccordionChevron" aria-hidden />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <ContentSearch
                  searchServiceUrl={searchServiceUrl}
                  setContentSearchResource={setContentSearchResource}
                  activeCanvas={activeCanvas}
                  annotationPage={contentSearchResource}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {renderAnnotation && annotationResources && (
            <AccordionItem value="manifest-annotations">
              <AccordionHeader>
                <AccordionTrigger>
                  <FontAwesomeIcon icon={faList} />
                  <Label
                    label={"Annotations" as unknown as InternationalString}
                  />
                  <AccordionChevron className="AccordionChevron" aria-hidden />
                </AccordionTrigger>
              </AccordionHeader>
              {annotationResources &&
                annotationResources.map((annotationPage) => (
                  <AccordionContent key={annotationPage.id}>
                    <AnnotationPage annotationPage={annotationPage} />
                  </AccordionContent>
                ))}
            </AccordionItem>
          )}

          {pluginsWithInfoPanel &&
            pluginsWithInfoPanel.map((plugin, i) => (
              <AccordionItem key={i} value={plugin.id}>
                <AccordionHeader>
                  <AccordionTrigger>
                    <Label
                      label={
                        plugin.informationPanel?.label as InternationalString
                      }
                    />
                    <AccordionChevron
                      className="AccordionChevron"
                      aria-hidden
                    />
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>
                  {renderPluginInformationPanel(plugin, i)}
                </AccordionContent>
              </AccordionItem>
            ))}
        </AccordionRoot>
      }
    </Wrapper>
  );
};

export default InformationPanel;
