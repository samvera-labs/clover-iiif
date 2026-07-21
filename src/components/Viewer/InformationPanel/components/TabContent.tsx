import React from "react";
import { Content } from "../InformationPanel.styled";
import Information from "../About/About";
import ContentSearch from "../ContentSearch/ContentSearch";
import ContentStateAnnotationPage from "../ContentState/Page";
import AnnotationCollectionPage from "../AnnotationCollection/Page";
import AnnotationPage from "../Annotation/Page";
import type {
  AnnotationResources,
  AnnotationResource,
} from "src/types/annotations";
import type { AnnotationPageNormalized } from "@iiif/presentation-3";
import { INFORMATION_PANEL_TABS } from "src/lib/information-panel-helpers";

interface TabContentProps {
  availableTabs: string[];
  contentSearchResource?: AnnotationResource;
  searchServiceUrl?: string;
  setContentSearchResource: React.Dispatch<
    React.SetStateAction<AnnotationPageNormalized | undefined>
  >;
  activeCanvas: string;
  contentSearchCallback?: (query: string) => void;
  initialSearchQuery?: string;
  contentStateAnnotation?:
    | import("@iiif/presentation-3").AnnotationNormalized
    | null;
  hasContentStateAnnotation: boolean;
  filteredAnnotationResources: AnnotationResources;
  hasAnnotationCollection: boolean;
  annotationCollection?:
    | import("src/types/annotation-collection").AnnotationCollectionNormalized
    | null;
}

export const TabContent: React.FC<TabContentProps> = ({
  availableTabs,
  contentSearchResource,
  searchServiceUrl,
  setContentSearchResource,
  activeCanvas,
  contentSearchCallback,
  initialSearchQuery,
  contentStateAnnotation,
  hasContentStateAnnotation,
  filteredAnnotationResources,
  hasAnnotationCollection,
  annotationCollection,
}) => {
  return (
    <>
      {availableTabs.includes(INFORMATION_PANEL_TABS.about) && (
        <Content value={INFORMATION_PANEL_TABS.about}>
          <Information />
        </Content>
      )}
      {availableTabs.includes(INFORMATION_PANEL_TABS.contentSearch) &&
        contentSearchResource && (
          <Content value={INFORMATION_PANEL_TABS.contentSearch}>
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
      {availableTabs.includes(INFORMATION_PANEL_TABS.annotations) && (
        <Content value={INFORMATION_PANEL_TABS.annotations}>
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
          {hasAnnotationCollection && annotationCollection && (
            <AnnotationCollectionPage
              annotationCollection={annotationCollection}
            />
          )}
        </Content>
      )}
    </>
  );
};
